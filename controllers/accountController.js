const common = require("../common/common");
const documentStorageHelper = require("../common/documentStorageHelper");
const secureKeyStorage = require("../common/secureKeyStorage");
// const passport = require("passport");
const fs = require("fs");

module.exports = {
  getEncryptionKey: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.sub);
    let key = await secureKeyStorage.retrieve(account.didPrivateKeyGuid);
    res.status(200).json({ encryptionKey: key });
  },

  myAccount: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.sub);
    let returnAccount = account.toAuthJSON();
    let documentSharedAccounts = [];

    for (let document of returnAccount.documents) {
      for (let shareAccountId of document.sharedWithAccountIds) {
        let shareAccount = await common.dbClient.getAccountById(shareAccountId);
        documentSharedAccounts.push(shareAccount.toPublicInfo());
      }
    }

    const accountType = account.accountType;

    let viewFeatures = await common.dbClient.getViewFeatureStringByManyIds(
      accountType.viewFeatures
    );
    let coreFeatures = await common.dbClient.getCoreFeatureStringByManyIds(
      accountType.coreFeatures
    );
    res.status(200).json({
      account: returnAccount,
      documentSharedAccounts: documentSharedAccounts,
      viewFeatures: viewFeatures,
      coreFeatures: coreFeatures
    });
  },

  getAccounts: async (req, res, next) => {
    const accounts = await common.dbClient.getAllAccounts();
    let returnAccounts = [];

    for (let account of accounts) {
      returnAccounts.push(account.toPublicInfo());
    }

    res.status(200).json(returnAccounts);
  },

  updateAccount: async (req, res, next) => {
    const accountId = req.payload.sub;
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

    // passport.authenticate("local", { session: false }, (err, account, info) => {
    //   if (err) {
    //     return next(err);
    //   }

      return res.json({ account: 'todo' });
      // if (account) {
        // account.token = account.generateJWT();
        
      // } else {
      //   return res.status(422).json(info);
      // }
    // })(req, res, next);
  },

  getShareRequests: async (req, res, next) => {
    let accountId = req.payload.sub;
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
    const account = await common.dbClient.getAccountById(req.payload.sub);
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
    const accountId = req.payload.sub;
    const file =
      req.files && req.files.img && req.files.img[0]
        ? req.files.img[0]
        : undefined;
    const thumbnailFile =
      req.files && req.files.img && req.files.img[1]
        ? req.files.img[1]
        : undefined;

    const fromAccountId = req.body.fromAccountId;
    const toAccountId = req.body.toAccountId;
    const documentTypeName = req.body.documentType;

    let authorized = false;

    if (accountId === fromAccountId || accountId === toAccountId) {
      authorized = true;
    }

    if (!authorized) {
      res.status(403).json({
        error: "Account not authorized to approve or create this share request",
      });
      return;
    }

    let approved = false;

    let key = undefined;
    let thumbnailKey = undefined;
    if (accountId === fromAccountId) {
      approved = true;
      if (file) {
        key = await documentStorageHelper.upload(file, "document");
      }
      if (thumbnailFile) {
        thumbnailKey = await documentStorageHelper.upload(
          thumbnailFile,
          "document"
        );
      }
    }

    let shareRequest = await common.dbClient.createShareRequest(
      toAccountId,
      fromAccountId,
      documentTypeName
    );

    if (approved) {
      shareRequest = await common.dbClient.approveOrDenyShareRequest(
        shareRequest._id,
        approved,
        key,
        thumbnailKey
      );
    }

    res.status(200).json(shareRequest);
  },

  approveOrDenyShareRequest: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.sub);
    const shareRequestId = req.params.shareRequestId;
    const approved = req.body.approved;

    const file =
      req.files && req.files.img && req.files.img[0]
        ? req.files.img[0]
        : undefined;
    const thumbnailFile =
      req.files && req.files.img && req.files.img[1]
        ? req.files.img[1]
        : undefined;

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

    let key;
    let thumbnailKey;
    if (file) {
      key = await documentStorageHelper.upload(file, "document");
    }
    if (thumbnailFile) {
      thumbnailKey = await documentStorageHelper.upload(
        thumbnailFile,
        "document"
      );
    }

    const shareRequest = await common.dbClient.approveOrDenyShareRequest(
      shareRequestId,
      approved,
      key,
      thumbnailKey
    );

    res.status(200).json(shareRequest);
  },

  deleteShareRequest: async (req, res, next) => {
    const shareRequestId = req.params.shareRequestId;
    const shareRequestAccountOwnerId = req.payload.sub;
    await common.dbClient.deleteShareRequest(
      shareRequestAccountOwnerId,
      shareRequestId
    );
    res.status(200).json({ message: "success" });
  },
};
