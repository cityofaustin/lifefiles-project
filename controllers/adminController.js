const common = require("../common/common");
const permanent = require("../common/permanentClient");
const uuidv4 = require("uuid").v4;
const secureKeyStorage = require("../common/secureKeyStorage");
const EthCrypto = require("eth-crypto");
const passport = require("passport");

module.exports = {
  oauthUrl: async (req, res, next) => {
    res.status(200).json({ url: process.env.OAUTH_URL });
  },

  myAdminAccount: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.id);

    if (account.role !== "admin" && account.canAddOtherAccounts !== true) {
      res.status(403).json({
        error: "Account not authorized",
      });
      return;
    }

    let returnAccount = account.toAuthJSON();
    adminInfo = await common.dbClient.getAdminData(req.payload.id);
    returnAccount.adminInfo = adminInfo;

    res.status(200).json({
      account: returnAccount,
    });
  },

  adminLogin: async (req, res, next) => {
    if (!req.body.account.email) {
      return res.status(422).json({ errors: { email: "can't be blank" } });
    }

    if (!req.body.account.password) {
      return res.status(422).json({ errors: { password: "can't be blank" } });
    }

    passport.authenticate("local", { session: false }, (err, account, info) => {
      if (err) {
        return next(err);
      }

      if (account) {
        if (account.role === "admin" || account.canAddOtherAccounts === true) {
          account.token = account.generateJWT();
          return res.json({ account: account.toAuthJSON() });
        } else {
          return res.status(403).json({
            error: "Account not authorized for admin page.",
          });
        }
      } else {
        return res.status(422).json(info);
      }
    })(req, res, next);
  },

  addDocumentType: async (req, res, next) => {
    const savedDocType = await common.dbClient.createDocumentType(req.body);

    res.status(200).json({
      savedDocType,
    });
  },

  updateDocumentType: async (req, res) => {
    const docTypeId = req.params.docTypeId;
    const docType = {
      name: req.body.name,
      isTwoSided: req.body.isTwoSided,
      hasExpirationDate: req.body.hasExpirationDate,
      isProtectedDoc: req.body.isProtectedDoc,
      isRecordableDoc: req.body.isRecordableDoc,
    };
    const documentTypeSaved = await common.dbClient.updateDocumentType(
      docTypeId,
      docType
    );
    return res.status(200).json({ documentTypeSaved });
  },

  deleteDocumentType: async (req, res, next) => {
    const docTypeId = req.params.docTypeId;
    await common.dbClient.deleteDocumentType(docTypeId);
    res.status(200).json({
      deleted: docTypeId,
    });
  },

  updateAccountType: async (req, res) => {
    const accountTypeId = req.params.accountTypeId;
    const accountType = {
      accountTypeName: req.body.accountTypeName,
      role: req.body.role,
      adminLevel: req.body.adminLevel,
      viewFeatures: req.body.viewFeatures,
      coreFeatures: req.body.coreFeatures,
    };
    const accountTypeSaved = await common.dbClient.updateAccountType(
      accountTypeId,
      accountType
    );
    return res.status(200).json({ accountTypeSaved });
  },

  deleteAccountType: async (req, res) => {
    const accountTypeId = req.params.accountTypeId;
    await common.dbClient.deleteAccountType(accountTypeId);
    res.status(200).json({
      deleted: accountTypeId,
    });
  },

  // This can be called by anyone
  newHelperAccount: async (req, res, next) => {
    const uuid = uuidv4();
    let did;

    // These helper accounts cannot make new accounts that can make new accounts
    req.body.account.canAddOtherAccounts = false;
    req.body.account.accounttype = "Case Manager Notary";

    const permanentArchiveNumber = await permanent.createArchive(
      req.body.account.email
    );

    if (req.body.account.publicEncryptionKey) {
      did = await common.blockchainClient.createNewDID();
      did.privateKey = "byok";
      did.publicEncryptionKey = req.body.account.publicEncryptionKey;
      did.privateKeyGuid = uuid;
      // Random password and this accout doesn't use it. They use the secure login method.
      req.body.account.password = uuidv4();
    } else {
      did = await common.blockchainClient.createNewDID();
      did.publicEncryptionKey = EthCrypto.publicKeyByPrivateKey(
        "0x" + did.privateKey
      );
      did.privateKeyGuid = uuid;
    }

    await secureKeyStorage.store(uuid, did.privateKey);

    let profileImageUrl = "anon-user.png";

    if (req.files && req.files.img) {
      profileImageUrl = await documentStorageHelper.upload(
        req.files.img,
        "profile-image"
      );
    }

    let account;
    try {
      account = await common.dbClient.createAccount(
        req.body.account,
        did,
        permanentArchiveNumber,
        profileImageUrl
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error });
    }

    return res.status(201).json({ account: account.toAuthJSON() });
  },

  newAccount: async (req, res, next) => {
    const adminAccountId = req.payload.id;

    const adminAccount = await common.dbClient.getAccountById(adminAccountId);

    // const adminLevel = await common.dbClient.getAccountAdminLevelById(
    //   adminAccountId
    // );

    const newAccountType = await common.dbClient.getAccountTypeByName(
      req.body.account.accounttype
    );

    if (newAccountType === undefined || newAccountType === null) {
      res.status(403).json({
        error: "Role does not exist",
      });
      return;
    }

    // Admin/itSpecialist can only create less powerful accounts
    // if (adminLevel >= newAccountType.adminLevel) {
    //   res.status(403).json({
    //     error: "Account not authorized to create accounts with this role level",
    //   });
    //   return;
    // }

    if (
      adminAccount.role !== "admin" &&
      adminAccount.canAddOtherAccounts !== true
    ) {
      res.status(403).json({
        error: "Account not authorized to create accounts with this role level",
      });
      return;
    }

    const permanentArchiveNumber = await permanent.createArchive(
      req.body.account.email
    );
    const uuid = uuidv4();

    let did = await common.blockchainClient.createNewDID();
    did.publicEncryptionKey = EthCrypto.publicKeyByPrivateKey(
      "0x" + did.privateKey
    );
    did.privateKeyGuid = uuid;

    await secureKeyStorage.store(uuid, did.privateKey);

    let profileImageUrl = "anon-user.png";

    if (req.files && req.files.img) {
      profileImageUrl = await documentStorageHelper.upload(
        req.files.img,
        "profile-image"
      );
    }

    // Helper accounts cannot make new accounts that can make new accounts
    if (adminAccount.canAddOtherAccounts == true) {
      req.body.account.canAddOtherAccounts = false;
    }

    let account;
    try {
      account = await common.dbClient.createAccount(
        req.body.account,
        did,
        permanentArchiveNumber,
        profileImageUrl
      );
    } catch (error) {
      return res.status(500).json({ msg: error });
    }

    return res.status(201).json({ account: account.toAuthJSON() });
  },

  updateAccount: async (req, res) => {
    const accountId = req.params.accountId;
    const updatedAccount = await common.dbClient.adminUpdateAccount(
      accountId,
      req.body.account
    );
    return res.status(200).json({ updatedAccount });
  },

  deleteAccount: async (req, res, next) => {
    await common.dbClient.deleteAccount(req.params.accountId);

    return res.status(200).json({ message: "success" });
  },

  genericGet: async (req, res, next, type) => {
    const adminAccountId = req.payload.id;
    const adminAccount = await common.dbClient.getAccountById(adminAccountId);

    if (
      adminAccount.role !== "admin" &&
      adminAccount.canAddOtherAccounts !== true
    ) {
      res.status(403).json({
        error: "Account not authorized to hit this route",
      });
      return;
    }

    let getResponse = await common.dbClient.genericGet(type);
    res.status(200).json({ response: getResponse });
  },

  genericPost: async (req, res, next, type) => {
    const adminAccountId = req.payload.id;
    const adminAccount = await common.dbClient.getAccountById(adminAccountId);

    if (
      adminAccount.role !== "admin" &&
      adminAccount.canAddOtherAccounts !== true
    ) {
      res.status(403).json({
        error: "Account not authorized to hit this route",
      });
      return;
    }

    try {
      postResponse = await common.dbClient.genericPost(req.body, type);
    } catch (error) {
      res.status(403).json({
        error: error,
      });
      return;
    }
    res.status(200).json({ response: postResponse });
  },

  // addDocumentTypeField: async (req, res, next) => {},

  // deleteDocumentTypeField: async (req, res, next) => {},

  // LEGACY
  // resetDatabase: async (req, res, next) => {
  //   await common.dbClient.resetDatabase();
  //   res.status(200).json({ message: "success" });
  // },

  getPermissions: async (req, res, next) => {
    const permissions = await common.dbClient.getAllPermissions();
    res.status(200).json({ permissions });
  },

  newPermission: async (req, res, next) => {
    const permission = await common.dbClient.createPermission(
      req.body.permission
    );
    return res.status(201).json({ permission: permission });
  },

  getRoles: async (req, res, next) => {
    const roles = await common.dbClient.getAllRoles();
    res.status(200).json({ roles });
  },

  newRole: async (req, res, next) => {
    const role = await common.dbClient.createRole(req.body.role);
    return res.status(201).json({ role: role });
  },

  newRolePermissionTable: async (req, res, next) => {
    const rolePermissionTable = await common.dbClient.newRolePermissionTable(
      req.body.rolePermissionTable
    );
    return res.status(201).json({ rolePermissionTable: rolePermissionTable });
  },

  getRolePermissionTable: async (req, res, next) => {
    const rolePermissionTable = await common.dbClient.getLatestRoleLPermissionTable();
    return res.status(200).json({ rolePermissionTable: rolePermissionTable });
  },

  generateDefaultRolePermissionsTable: async (req, res, next) => {
    const roles = await common.dbClient.getAllRoles();
    const permissions = await common.dbClient.getAllPermissions();

    let rolePermissionTable = {};

    for (role of roles) {
      for (permission of permissions) {
        if (permission.paired === false) {
          rolePermissionTable[role.name + "-" + permission.name] = true;
        }
      }
    }

    for (role of roles) {
      for (innerRole of roles) {
        for (permission of permissions) {
          if (permission.paired === true) {
            if (role.name !== innerRole.name) {
              rolePermissionTable[
                role.name + "-" + permission.name + "-" + innerRole.name
              ] = true;
            }
          }
        }
      }
    }
    return res.status(201).json({ rolePermissionTable: rolePermissionTable });
  },
};
