const common = require("../common/common");
const permanent = require("../common/permanentClient");
const documentStorageHelper = require("../common/documentStorageHelper");
const secureKeyStorage = require("../common/secureKeyStorage");
const passport = require("passport");
const fs = require("fs");
const EthCrypto = require("eth-crypto");
const uuidv4 = require("uuid").v4;

module.exports = {
  getEncryptionKey: async (req, res, next) => {
    account = await common.dbClient.getAccountById(req.payload.id);
    let key = await secureKeyStorage.retrieve(account.didPrivateKeyGuid);
    res.status(200).json({ encryptionKey: key.data.value });
  },

  getAcccount: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.id);
    let returnAccount = account.toAuthJSON();
    let documentSharedAccounts = [];

    for (let document of returnAccount.documents) {
      for (let shareAccountId of document.sharedWithAccountIds) {
        let shareAccount = await common.dbClient.getAccountById(shareAccountId);
        documentSharedAccounts.push(shareAccount.toPublicInfo());
      }
    }

    res.status(200).json({
      account: returnAccount,
      documentSharedAccounts: documentSharedAccounts,
    });
  },

  getAcccounts: async (req, res, next) => {
    const accounts = await common.dbClient.getAllAccounts();
    let returnAccounts = [];

    for (let account of accounts) {
      returnAccounts.push(account.toPublicInfo());
    }

    res.status(200).json(returnAccounts);
  },

  newAccount: async (req, res, next) => {
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

    const account = await common.dbClient.createAccount(
      req.body.account,
      did,
      permanentArchiveNumber,
      profileImageUrl
    );

    return res.status(201).json({ account: account.toAuthJSON() });
  },

  updateAccount: async (req, res, next) => {
    const accountId = req.payload.id;
    const account = await common.dbClient.getAccountById(accountId);

    let profileImageUrl = account.profileImageUrl;

    if (req.files && req.files.img) {
      profileImageUrl = await documentStorageHelper.upload(
        req.files.img,
        "profile-image"
      );
    }

    const updatedAccount = await common.dbClient.updateAccount(
      accountId,
      profileImageUrl
    );

    return res.status(201).json({ account: updatedAccount.toAuthJSON() });
  },

  login: async (req, res, next) => {
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
        account.token = account.generateJWT();
        return res.json({ account: account.toAuthJSON() });
      } else {
        return res.status(422).json(info);
      }
    })(req, res, next);
  },

  getShareRequests: async (req, res, next) => {
    let accountId = req.payload.id;
    if (req.params && req.params.accountId) {
      accountId = req.params.accountId;
    }

    const shareRequests = await common.dbClient.getShareRequests(accountId);

    res.status(200).json(shareRequests);
  },

  getAvailableDocumentTypes: async (req, res, next) => {
    const accountId = req.params.accountId;
    const documents = await common.dbClient.getDocuments(accountId);
    let documentTypes = [];
    for (let document of documents) {
      documentTypes.push(document.type);
    }
    res.status(200).json(documentTypes);
  },

  getProfileImage: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    let payload;

    if (account.profileImageUrl === "anon-user.png") {
      payload = fs.createReadStream("./assets/anon-user.png");
    } else {
      payload = await documentStorageHelper.getDocumentBytes(
        req.params.imageurl,
        "profile-image"
      );
    }

    payload.pipe(res);
  },

  newShareRequest: async (req, res, next) => {
    const accountId = req.payload.id;

    const fromAccountId = req.body.shareRequest.fromAccountId;
    const toAccountId = req.body.shareRequest.toAccountId;
    const documentTypeName = req.body.shareRequest.documentType;

    let authorized = false;

    if (accountId == fromAccountId || accountId == toAccountId) {
      authorized = true;
    }

    if (!authorized) {
      res.status(403).json({
        error: "Account not authorized to approve or create this share request",
      });
      return;
    }

    let approved = false;

    if (accountId == fromAccountId) {
      approved = true;
    }

    let shareRequest = await common.dbClient.createShareRequest(
      toAccountId,
      fromAccountId,
      documentTypeName
    );

    if (approved) {
      shareRequest = await common.dbClient.approveOrDenyShareRequest(
        shareRequest._id,
        approved
      );
    }

    res.status(200).json(shareRequest);
  },

  approveOrDenyShareRequest: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.id);
    const shareRequestId = req.params.shareRequestId;
    const approved = req.body.approved;

    let authorized = false;

    for (let shareRequest of account.shareRequests) {
      if (shareRequest._id.equals(shareRequestId)) {
        authorized = true;
        break;
      }
    }

    if (!authorized) {
      res.status(403).json({
        error: "Account not authorized to approve this share request",
      });
      return;
    }

    const shareRequest = await common.dbClient.approveOrDenyShareRequest(
      shareRequestId,
      approved
    );

    res.status(200).json(shareRequest);
  },

  deleteShareRequest: async (req, res, next) => {
    const shareRequestId = req.params.shareRequestId;
    const shareRequestAccountOwnerId = req.payload.id;
    await common.dbClient.deleteShareRequest(
      shareRequestAccountOwnerId,
      shareRequestId
    );
    res.status(200).json({ message: "success" });
  },
};
