const mongoose = require("mongoose");
const secureKeyStorage = require("../../common/secureKeyStorage");

const DBUtil = require("./DBUtil");

const Account = require("./models/Account");
const Document = require("./models/Document");
const AccountType = require("./models/AccountType");
const ViewFeature = require("./models/ViewFeature");
const CoreFeature = require("./models/CoreFeature");
const DocumentType = require("./models/DocumentType");
const Key = require("./models/Key");
const Role = require("./models/Role");
const Permission = require("./models/Permission");
const ShareRequest = require("./models/ShareRequest");
const RolePermissionTable = require("./models/RolePermissionTable");
const VerifiableCredential = require("./models/VerifiableCredential");
const VerifiablePresentation = require("./models/VerifiablePresentation");
const AppSetting = require("./models/AppSetting");
const HelperContact = require("./models/HelperContact");
const AdminCryptoKey = require("./models/AdminCryptoKey");
const { find } = require("./models/Account");

const classes = new Map();
classes.set("AccountType", AccountType);
classes.set("ViewFeature", ViewFeature);
classes.set("CoreFeature", CoreFeature);

let mongoDbOptions = {
  autoIndex: true, // this makes schema index's enforced
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
};

class MongoDbClient {
  constructor() {
    this.cachedRolePermissionTable = undefined;
    this.mongoURI = process.env.MONGODB_URI;

    mongoose.connect(this.mongoURI, mongoDbOptions).then(() => {
      this.populateDefaultValues();
      this.updateRolePermissionsTableCache();
    });
  }

  async resetDatabase() {
    await Account.collection.drop();
    await Document.collection.drop();
    await ShareRequest.collection.drop();
    await this.populateDefaultValues();
  }
  // DB initial setup
  async populateDefaultValues() {
    DBUtil.populateDefaultValues(this, secureKeyStorage);
  }

  // Cache
  async updateRolePermissionsTableCache() {
    this.cachedRolePermissionTable = await this.getLatestRolePermissionTable();
  }

  getCachedRolePermissionsTable() {
    return this.cachedRolePermissionTable;
  }
  // Encrytpion Keys
  async store(guid, key) {
    const keyEntity = new Key();
    keyEntity.uuid = guid;
    keyEntity.encryptedKey = key;
    await keyEntity.save();
    return keyEntity;
  }
  async retrieve(guid) {
    let key = await Key.findOne({
      uuid: guid,
    });

    return key;
  }

  // Helpers
  async genericGet(type) {
    const TheClass = classes.get(type);
    const allObjects = await TheClass.find({});
    return allObjects;
  }

  async genericPost(postBody, type) {
    const TheClass = classes.get(type);
    const newClassInstance = new TheClass();

    for (var key of Object.keys(postBody)) {
      newClassInstance[key] = postBody[key];
    }

    await newClassInstance.save();
    return newClassInstance;
  }

  // Admin
  async getAdminData() {
    let adminData = {};

    const rawAccounts = await Account.find({}).populate("accountType");

    let accounts = [];
    for (let rawAccount of rawAccounts) {
      let returnAccount = rawAccount.toPublicInfo();
      returnAccount["accountType"] = rawAccount.accountType.accountTypeName;
      accounts.push(returnAccount);
    }

    adminData.accounts = accounts;
    adminData.documentTypes = await DocumentType.find({});
    adminData.accountTypes = await AccountType.find({})
      .populate({ path: "viewFeatures" })
      .populate({ path: "coreFeatures" });

    adminData.viewFeatures = await ViewFeature.find({});
    adminData.coreFeatures = await CoreFeature.find({});
    adminData.adminCryptoKey = await AdminCryptoKey.findOne();
    return adminData;
  }

  async setAdminPrivateKey(publicKey, privateKey) {
    let adminCryptoKey;
    adminCryptoKey = await AdminCryptoKey.findOne();

    if (adminCryptoKey === null || adminCryptoKey === undefined) {
      adminCryptoKey = new AdminCryptoKey();
    }

    adminCryptoKey.publicKey = publicKey;
    adminCryptoKey.privateKey = privateKey;
    await adminCryptoKey.save();
    return adminCryptoKey;
  }

  async getAdminPublicKey() {
    let adminCryptoKey = await AdminCryptoKey.findOne();
    return adminCryptoKey.publicKey;
  }

  async getAdminPrivateKey() {
    let adminCryptoKey = await AdminCryptoKey.findOne();
    return adminCryptoKey;
  }

  // Accounts

  async getAccountByOAuthId(id) {
    const accounts = await Account.find({ oauthId: id });
    return accounts[0];
  }

  async setAccountPhoneNumber(username, phoneNumber) {
    const account = await Account.findOne({ username });
    account.phoneNumber = phoneNumber;
    await account.save();
    return account;
  }

  async getAccountByUsername(username) {
    const accounts = await Account.find({ username: username });
    return accounts[0];
  }

  async getAccountByShareRequest(shareRequestId) {
    const account = await Account.findOne({ shareRequests: shareRequestId });
    return account;
  }

  async getAccountByUsernameWithShareRequests(username) {
    const account = await Account.findOne({ username }).populate({
      path: "shareRequests",
    });
    return account;
  }

  async getAccountById(id) {
    const account = await Account.findById(id);
    return account;
  }

  async getAccountAdminLevelById(id) {
    const account = await Account.findById(id);
    const accountType = await AccountType.findById(account.accountType);
    return accountType.adminLevel;
  }

  async updateAccountSignMessage(accountId, signMessage) {
    const account = await Account.findById(accountId);
    account.signMessage = signMessage;
    await account.save();
    return account;
  }

  async getAllAccountInfoById(id) {
    const account = await Account.findById(id).populate([
      "documents",
      "shareRequests",
      "accountType",
    ]);
    return account;
  }

  async getAllAccounts() {
    const accounts = await Account.find({});
    return accounts;
  }

  // app settings
  async saveAppSetting(_appSetting) {
    const appSetting = new AppSetting();
    appSetting.settingName = _appSetting.settingName;
    appSetting.settingValue = _appSetting.settingValue;
    return await AppSetting.findOneAndUpdate(
      { settingName: appSetting.settingName },
      { settingValue: appSetting.settingValue },
      {
        new: true,
        upsert: true,
      }
    );
  }
  async getAppSettings() {
    return await AppSetting.find();
  }

  // helper contacts
  async saveHelperContact(hc) {
    // their _id is not the account id
    delete hc.ownerAccount;
    delete hc.helperAccount;
    return await HelperContact.updateOne({ _id: hc._id }, hc);
  }

  async getHelperContactById(id) {
    return await HelperContact.findById(id)
      .populate({ path: "ownerAccount" })
      .populate({ path: "helperAccount" });
  }
  async getHelperContactsForOwner(accountId) {
    return await HelperContact.find({ ownerAccount: accountId })
      .populate({ path: "ownerAccount" })
      .populate({ path: "helperAccount" });
  }
  async getHelperContactsForHelper(accountId) {
    return await HelperContact.find({ helperAccount: accountId })
      .populate({ path: "ownerAccount" })
      .populate({ path: "helperAccount" });
  }
  async addHelperContact(_helperContact) {
    let helperContact = new HelperContact();
    helperContact.ownerAccount = _helperContact.ownerAccount;
    helperContact.helperAccount = _helperContact.helperAccount;
    helperContact.isSocialAttestationEnabled =
      _helperContact.isSocialAttestationEnabled;
    helperContact.canAddNewDocuments = _helperContact.canAddNewDocuments;
    await helperContact.save();
    const ownerAccount = await this.getAccountById(_helperContact.ownerAccount);
    ownerAccount.helperContacts.push(helperContact);
    await ownerAccount.save();
    const helperAccount = await this.getAccountById(
      _helperContact.helperAccount
    );
    helperAccount.helperContacts.push(helperContact);
    await helperAccount.save();
    helperContact = await HelperContact.populate(helperContact, {
      path: "ownerAccount",
    });
    helperContact = await HelperContact.populate(helperContact, {
      path: "helperAccount",
    });
    return helperContact;
  }
  async deleteHelperContact(id) {
    const hc = await HelperContact.findById(id);
    if (hc) {
      let ownerAccount = await Account.findById(hc.ownerAccount);
      if (ownerAccount) {
        await ownerAccount.helperContacts.pull({ _id: id });
        await ownerAccount.save();
      }
      let helperAccount = await Account.findById(hc.helperAccount);
      if (helperAccount) {
        await helperAccount.helperContacts.pull({ _id: id });
        await helperAccount.save();
      }
      const hc2 = await HelperContact.findOneAndRemove({
        _id: id,
      });
      return hc2;
    }
    return hc;
  }

  // Core Features
  async addCoreFeature(feature) {
    const coreFeature = new CoreFeature();
    coreFeature.featureName = feature.featureName;
    coreFeature.featureDisplay = feature.featureDisplay;
    coreFeature.featureRole = feature.featureRole;
    await coreFeature.save();
    return coreFeature;
  }

  // View Featuers and Account Types
  async addViewFeature(feature) {
    const viewFeature = new ViewFeature();
    viewFeature.featureName = feature.featureName;
    viewFeature.featureDisplay = feature.featureDisplay;
    await viewFeature.save();
    return viewFeature;
  }

  async getAccountTypesById(id) {
    const accountType = await AccountType.findById(id).populate([
      "coreFeatures",
      "viewFeatures",
    ]);
    return accountType;
  }

  async getAllAccountTypes() {
    const accountType = await AccountType.find({});
    return accountType;
  }

  async getAccountTypeByName(accountTypeName) {
    const accountType = await AccountType.findOne({
      accountTypeName: accountTypeName,
    });
    return accountType;
  }

  async createAccountType(accountTypeInput, adminLevel) {
    const accountType = new AccountType();
    accountType.accountTypeName = accountTypeInput.accountTypeName;
    accountType.role = accountTypeInput.role;
    accountType.adminLevel = adminLevel;
    await accountType.save();
    return accountType;
  }

  async addCoreFeatureToAccountType(accountTypeName, featureName) {
    const coreFeature = await CoreFeature.findOne({ featureName: featureName });
    const accountType = await AccountType.findOne({
      accountTypeName: accountTypeName,
    });
    accountType.coreFeatures.push(coreFeature);
    await accountType.save();
    return accountType;
  }

  async addViewFeatureToAccountType(accountTypeName, featureName) {
    const viewFeature = await ViewFeature.findOne({ featureName: featureName });
    const accountType = await AccountType.findOne({
      accountTypeName: accountTypeName,
    });
    accountType.viewFeatures.push(viewFeature);
    await accountType.save();
    return accountType;
  }

  async getCoreFeatureStringByManyIds(ids) {
    let coreFeatures = await CoreFeature.find().where("_id").in(ids).exec();

    let coreFeaturesStringArr = [];
    for (let coreFeature of coreFeatures) {
      coreFeaturesStringArr.push(coreFeature.featureName);
    }

    return coreFeaturesStringArr;
  }

  async getViewFeatureStringByManyIds(ids) {
    let viewFeatures = await ViewFeature.find().where("_id").in(ids).exec();

    let viewFeaturesStringArr = [];
    for (let viewFeature of viewFeatures) {
      viewFeaturesStringArr.push(viewFeature.featureName);
    }

    return viewFeaturesStringArr;
  }

  async createAccount(
    accountReq,
    did,
    permanentOrgArchiveNumber,
    profileImageUrl
  ) {
    const newAccount = new Account();
    newAccount.username = accountReq.username;
    newAccount.firstName = accountReq.firstname;
    newAccount.lastName = accountReq.lastname;
    newAccount.email = accountReq.email;
    newAccount.phoneNumber = accountReq.phoneNumber
      ? accountReq.phoneNumber
      : accountReq.phonenumber; // there are some spots where it's all lowercase
    newAccount.organization = accountReq.organization;
    newAccount.permanentOrgArchiveNumber = permanentOrgArchiveNumber;

    newAccount.didAddress = did.address;
    newAccount.didPublicEncryptionKey = did.publicEncryptionKey;
    newAccount.didPrivateKeyGuid = did.privateKeyGuid;
    if (profileImageUrl) {
      newAccount.profileImageUrl = profileImageUrl;
    }
    if (accountReq.canAddOtherAccounts === undefined) {
      newAccount.canAddOtherAccounts = false;
    } else {
      newAccount.canAddOtherAccounts = accountReq.canAddOtherAccounts;
    }

    if (accountReq.isSecure) {
      newAccount.isSecure = accountReq.isSecure;
    }
    if (accountReq.password) {
      newAccount.setPassword(accountReq.password);
    }

    newAccount.oauthId = accountReq.oauthId;

    if (newAccount.email === "owner@owner.com") {
      newAccount.oauthId = "sally-oauth-123";
    }

    if (newAccount.email === "caseworker@caseworker.com") {
      newAccount.oauthId = "billy-oauth-123";
    }

    if (newAccount.email === process.env.ADMIN_EMAIL) {
      newAccount.oauthId = "admin-oauth-123";
    }

    const accountType = await this.getAccountTypeByName(accountReq.accounttype);

    newAccount.accountType = accountType;
    newAccount.role = accountType.role;
    if (accountReq.notaryId && accountReq.notaryState) {
      newAccount.notaryId = accountReq.notaryId;
      newAccount.notaryState = accountReq.notaryState;
    }

    const savedAccount = await newAccount.save();
    return savedAccount;
  }

  async adminUpdateAccount(accountId, accountReq) {
    const account = await Account.findById(accountId);
    account.username = accountReq.username;
    account.email = accountReq.email;
    account.firstName = accountReq.firstname;
    account.lastName = accountReq.lastname;
    account.canAddOtherAccounts = accountReq.canAddOtherAccounts;

    if (accountReq.password) {
      account.setPassword(accountReq.password);
    }

    const accountType = await this.getAccountTypeByName(accountReq.accounttype);

    account.accountType = accountType;
    await account.save();
    return account;
  }

  async updateAccount(
    accountId,
    profileImageUrl,
    phoneNumber = undefined,
    firstName = undefined,
    lastName = undefined,
    isNotDisplayPhoto = false,
    isNotDisplayName = false,
    isNotDisplayPhone = false
  ) {
    const account = await Account.findById(accountId);
    account.profileImageUrl = profileImageUrl;
    account.phoneNumber = phoneNumber;
    account.firstName = firstName;
    account.lastName = lastName;
    account.isNotDisplayPhoto = isNotDisplayPhoto;
    account.isNotDisplayName = isNotDisplayName;
    account.isNotDisplayPhone = isNotDisplayPhone;
    await account.save();
    return account;
  }

  async getShareRequests(accountId) {
    const account = await Account.findById(accountId).populate({
      path: "shareRequests",
    });

    return account.shareRequests;
  }

  async getShareRequestsBySharedWith(accountId) {
    const shareRequests = await ShareRequest.find({
      shareWithAccountId: accountId,
    });
    return shareRequests;
  }

  async getShareRequestByUrl(url) {
    let shareRequest = await ShareRequest.findOne({
      $or: [{ documentUrl: url }, { documentThumbnailUrl: url }],
    });
    return shareRequest;
  }

  async getShareRequestById(id) {
    const shareRequest = await ShareRequest.findById(id);
    return shareRequest;
  }

  // NOTE: share request doesn't have document id but it has document type
  async deleteShareRequestByDocumentId(documentType) {
    await ShareRequest.deleteMany({
      documentType: documentType,
    });
    return;
  }
  async deleteShareRequestByIds(ids) {
    await ShareRequest.deleteMany({
      _id: {
        $in: ids,
      },
    });
    return;
  }
  async deleteShareRequest(shareRequestAccountOwnerId, shareRequestId) {
    let account = await Account.findById(shareRequestAccountOwnerId);

    // Remove share request from owner
    await account.shareRequests.pull({ _id: shareRequestId });
    await account.save();

    // Delete Share Request
    await ShareRequest.deleteMany({
      _id: shareRequestId,
    });

    return;
  }

  // TODO: Make document id / url explicit in share request params
  async createShareRequest(
    accountRequestingId,
    accountId,
    documentTypeName,
    canView = false,
    canReplace = false,
    canDownload = false
  ) {
    const account = await Account.findById(accountId);
    const documents = await this.getDocuments(accountId);

    let documentUrl;
    let documentId;

    for (let document of documents) {
      if (documentTypeName === document.type) {
        documentUrl = document.url;
        documentId = document._id;
        break;
      }
    }

    if (documentUrl === undefined) {
      throw new Error("Document Not Found For Type: " + documentTypeName);
    }

    const shareRequest = new ShareRequest();
    shareRequest.shareWithAccountId = accountRequestingId;
    shareRequest.approved = false;
    shareRequest.documentType = documentTypeName;
    shareRequest.documentUrl = documentUrl;
    shareRequest.documentId = documentId;
    shareRequest.canView = canView;
    shareRequest.canReplace = canReplace;
    shareRequest.canDownload = canDownload;
    await shareRequest.save();

    account.shareRequests.push(shareRequest);
    await account.save();

    return shareRequest;
  }

  async approveOrDenyShareRequest(shareRequestId, approved, key, thumbnailKey) {
    const shareRequest = await ShareRequest.findById(shareRequestId);
    shareRequest.approved = approved;
    shareRequest.documentUrl = key;
    shareRequest.documentThumbnailUrl = thumbnailKey;

    await shareRequest.save();

    return shareRequest;
  }

  async updateShareRequestPermissions(
    shareRequestId,
    canView,
    canReplace,
    canDownload
  ) {
    const shareRequest = await ShareRequest.findById(shareRequestId);
    shareRequest.canView = canView;
    shareRequest.canReplace = canReplace;
    shareRequest.canDownload = canDownload;
    await shareRequest.save();
    return shareRequest;
  }

  // Document Types
  async getAllDocumentTypes() {
    const documentTypes = await DocumentType.find({});
    return documentTypes;
  }

  async createDocumentType(documentType) {
    const newDocumentType = new DocumentType();
    newDocumentType.name = documentType.name;
    newDocumentType.isTwoSided = documentType.isTwoSided;
    newDocumentType.hasExpirationDate = documentType.hasExpirationDate;
    newDocumentType.isProtectedDoc = documentType.isProtectedDoc;
    newDocumentType.isRecordableDoc = documentType.isRecordableDoc;

    if (documentType.fields !== undefined) {
      for (let field of documentType.fields) {
        newDocumentType.fields.push(field);
      }
    }
    const documentTypeSaved = await newDocumentType.save();
    return documentTypeSaved;
  }

  async updateDocumentType(id, documentType) {
    const docType = await DocumentType.findById(id);
    docType.name = documentType.name;
    docType.isTwoSided = documentType.isTwoSided;
    docType.hasExpirationDate = documentType.hasExpirationDate;
    docType.isProtectedDoc = documentType.isProtectedDoc;
    docType.isRecordableDoc = documentType.isRecordableDoc;

    const documentTypeSaved = await docType.save();
    return documentTypeSaved;
  }

  async deleteDocumentType(docTypeId) {
    const docuemntType = await DocumentType.findOneAndRemove({
      _id: docTypeId,
    });

    return docuemntType;
  }

  async updateAccountType(id, accountType) {
    const accType = await AccountType.findById(id);
    accType.accountTypeName = accountType.accountTypeName;
    accType.role = accountType.role;
    accType.adminLevel = accountType.adminLevel;
    accType.viewFeatures = accountType.viewFeatures;
    accType.coreFeatures = accountType.coreFeatures;

    const accountTypeSaved = await accType.save();
    return accountTypeSaved;
  }

  async deleteAccountType(accountTypeId) {
    const accountType = await AccountType.findOneAndRemove({
      _id: accountTypeId,
    });

    return accountType;
  }

  async deleteAccount(accountId) {
    const account = await Account.findOneAndRemove({
      _id: accountId,
    });

    return account;
  }

  // Documents
  async createDocument(
    uploadedByAccount,
    uploadForAccount,
    originalFileName,
    fileKey,
    thumbnailKey,
    documentType,
    permanentOrgFileArchiveNumber,
    md5,
    validUntilDate,
    encryptionPubKey,
    claimed = true
  ) {
    let date;
    if (validUntilDate !== undefined && !(validUntilDate instanceof Date)) {
      date = new Date(validUntilDate);
    }

    const newDocument = new Document();
    newDocument.name = originalFileName;
    newDocument.url = fileKey;
    newDocument.thumbnailUrl = thumbnailKey;
    newDocument.uploadedBy = uploadedByAccount;
    newDocument.belongsTo = uploadForAccount;
    newDocument.encryptionPubKey = encryptionPubKey;
    newDocument.type = documentType;
    newDocument.permanentOrgFileArchiveNumber = permanentOrgFileArchiveNumber;
    newDocument.hash = md5;
    newDocument.validUntilDate = date;
    newDocument.claimed = claimed;
    await newDocument.save();

    uploadForAccount.documents.push(newDocument);
    await uploadForAccount.save();

    return newDocument;
  }

  async updateDocument(
    documentId,
    filename,
    key,
    thumbnailKey,
    permanentOrgFileArchiveNumber,
    md5,
    validUntilDate,
    claimed
  ) {
    let document = await Document.findById(documentId);

    let date = validUntilDate;

    if (
      validUntilDate !== undefined &&
      !(validUntilDate instanceof Date) &&
      validUntilDate.includes("-")
    ) {
      date = new Date(validUntilDate);
    }

    document.name = filename;
    document.url = key;
    document.thumbnailUrl = thumbnailKey;

    document.permanentOrgFileArchiveNumber = permanentOrgFileArchiveNumber;
    document.hash = md5;
    document.validUntilDate = date;
    document.claimed = claimed;
    await document.save();

    return document;
  }

  async updateDocumentVC(
    documentId,
    vc,
    vpDocumentDidAddress,
    filename,
    key,
    permanentOrgFileArchiveNumber,
    md5,
    helperId,
    helperKey
  ) {
    let document = await Document.findById(documentId);
    document.vcJwt = vc;

    document.vpDocumentDidAddress = vpDocumentDidAddress;

    document.name = filename;
    document.url = key;
    document.permanentOrgFileArchiveNumber = permanentOrgFileArchiveNumber;
    document.hash = md5;
    await document.save();

    let shareRequest = await ShareRequest.findOne({
      shareWithAccountId: helperId,
      documentType: document.type,
    });

    shareRequest.documentUrl = helperKey;
    await shareRequest.save();

    return document;
  }

  async updateDocumentVP(documentId, vpJwt) {
    let document = await Document.findById(documentId);
    document.vpJwt = vpJwt;
    await document.save();
    return document;
  }

  async getDocuments(accountId) {
    const account = await Account.findById(accountId);

    let documents = await Document.find({
      _id: {
        $in: account.documents,
      },
    });

    return documents;
  }

  async getDocument(filename) {
    let document = await Document.findOne({
      $or: [{ url: filename }, { thumbnailUrl: filename }],
    });
    return document;
  }

  async getDocumentById(documentId) {
    let document = await Document.findById(documentId);
    return document;
  }

  async getDocumentByDocumentType(accountId, documentType) {
    const documents = await this.getDocuments(accountId);

    let documentId;

    for (let document of documents) {
      if (documentType === document.type) {
        documentId = document._id;
        break;
      }
    }
    const document = await this.getDocumentById(documentId);
    return document;
  }

  async deleteDocument(filename) {
    const document = await Document.findOneAndRemove({
      url: filename,
    });

    return document;
  }

  // Admin - Roles
  async getAllRoles() {
    const roles = await Role.find({});
    return roles;
  }

  async createRole(role) {
    const newRole = new Role();
    newRole.name = role.name;
    const roleSaved = await newRole.save();
    return roleSaved;
  }

  // Admin - Permissions
  async getAllPermissions() {
    const permissions = await Permission.find({});
    return permissions;
  }

  async createPermission(permission) {
    const newPermission = new Permission();
    newPermission.name = permission.name;
    newPermission.paired = permission.paired;
    const permissionSaved = await newPermission.save();
    return permissionSaved;
  }

  // Admin - Role Permission Table
  async getLatestRolePermissionTable() {
    // Get latest role permission table for role permissions table versioning
    const rolePermissionTable = await RolePermissionTable.findOne()
      .limit(1)
      .sort({ $natural: -1 });

    if (rolePermissionTable === null || rolePermissionTable === undefined) {
      return {};
    } else {
      return JSON.parse(rolePermissionTable.rolePermissionTable);
    }
  }

  async newRolePermissionTable(rolePermissionTable) {
    const newRolePermissionTable = new RolePermissionTable();
    newRolePermissionTable.rolePermissionTable = JSON.stringify(
      rolePermissionTable
    );
    const rolePermissionTableSaved = await newRolePermissionTable.save();

    this.updateRolePermissionsTableCache();
    return rolePermissionTableSaved;
  }

  // Blockchain
  async createVerifiableCredential(
    vcJwt,
    verifiedVC,
    issuer,
    document,
    privateKey
  ) {
    const newVC = new VerifiableCredential();
    newVC.vcJwt = vcJwt;
    newVC.verifiedVC = verifiedVC;
    newVC.issuer = issuer;
    newVC.document = document;
    newVC.documentDid = document.did;
    newVC.documentDidPrivateKey = privateKey;
    const vc = await newVC.save();

    document.vcJwt = vcJwt;
    await document.save();

    return vc;
  }

  async createVerifiablePresentation(vpJwt, verifiedVP, issuer, document) {
    const newVP = new VerifiablePresentation();
    newVP.vpJwt = vpJwt;
    newVP.verifiedVP = verifiedVP;
    newVP.issuer = issuer;
    newVP.document = document;
    newVP.documentDid = document.did;
    const vp = await newVP.save();

    document.vpJwt = vpJwt;
    await document.save();

    return vp;
  }
}

module.exports = MongoDbClient;
