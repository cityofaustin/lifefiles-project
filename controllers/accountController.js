const common = require("../common/common");
const documentStorageHelper = require("../common/documentStorageHelper");
const secureKeyStorage = require("../common/secureKeyStorage");
const passport = require("passport");
const fs = require("fs");
const permanent = require("../common/permanentClient");
const uuidv4 = require("uuid").v4;
const EthCrypto = require("eth-crypto");
const smsUtil = require("../common/smsUtil");

module.exports = {
  getEncryptionKey: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    let key = await secureKeyStorage.retrieve(account.didPrivateKeyGuid);
    res.status(200).json({ encryptionKey: key });
  },

  sendOneTimeAccessCode: async (req, res, next) => {
    let username = req.params.username;
    let oneTimeCode = req.params.oneTimeCode;
    let loginUuid = req.params.loginUuid;
    let sendEmail = req.body.sendEmail;
    let sendSms = req.body.sendSms;
    let secret = req.body.secret;

    // let { username, oneTimeCode, loginUuid } = { ...req.params };
    // let { sendEmail, sendSms, secret } = { ...req.body };

    // sort of serving as the api key so that not just anyone
    // but only the auth server can send sms message and emails.
    if (secret !== process.env.AUTH_SECRET) {
      res.status(403).json({ message: "failure" });
    }

    let account = await common.dbClient.getAccountByUsername(username);
    let contactEmail;
    let contactPhoneNumber;

    if (
      account.username.toLowerCase() == "owner".toLowerCase() ||
      account.username.toLowerCase() == "caseworker".toLowerCase()
    ) {
      contactEmail = process.env.CONTACT_EMAIL;
      contactPhoneNumber = process.env.CONTACT_PHONE;
    } else {
      contactEmail = account.email;
      contactPhoneNumber = account.phoneNumber;
    }

    if (sendEmail) {
      try {
        const send = require("gmail-send")({
          user: "adam.carnagey.dev@gmail.com",
          pass: process.env.MYPASS_GMAIL_PASSWORD,
          to: contactEmail,
          subject: `Mypass user ${username} is requesting a login code`,
        });

        send(
          {
            // eslint-disable-next-line
            text: `The one time code for user: ${username} is ${oneTimeCode}. Alternatively you can click this link to generate a code and send it to the users email:  ${process.env.OAUTH_URL}/provide-social-login-code/${loginUuid}`,
          },
          (error, result, fullResult) => {
            if (error) console.error(error);
            console.log(result);
          }
        );
      } catch (err) {
        console.log("error!");
        console.log(err);
        res.status(500).json({ message: "failure" });
      }
    }

    if (sendSms) {
      try {
        smsUtil.sendSms(
          `The one time code for user: ${username} is ${oneTimeCode}.`,
          "+1" + contactPhoneNumber
        );
      } catch (err) {
        console.log("error!");
        console.log(err);
        res.status(500).json({ message: "failure" });
      }
    }

    res.status(200).json({ message: "success" });
  },

  // TODO FINISH THIS IMPLEMENTATION TO SEND TO OWNER'S CONTACTS
  sendOneTimeAccessCodeToHelpers: async (req, res, next) => {
    let username = req.params.username;
    let oneTimeCode = req.params.oneTimeCode;
    let loginUuid = req.params.loginUuid;
    let sendEmail = req.body.sendEmail;
    let sendSms = req.body.sendSms;
    let secret = req.body.secret;

    // sort of serving as the api key so that not just anyone
    // but only the auth server can send sms message and emails.
    if (secret !== process.env.AUTH_SECRET) {
      res.status(403).json({ message: "failure" });
    }

    let account = await common.dbClient.getAccountByUsername(username);
    console.log("TODO: Send login code to this contacts helpers");

    res.status(200).json({ message: "success" });
  },

  secureLogin: async (req, res, next) => {
    let account = await common.dbClient.getAccountByUsername(
      req.body.account.username.toLowerCase()
    );

    if (account === undefined) {
      return res.status(422).json({ msg: "Account not found" });
    }

    // They have not included a signature so create a message for them to sign
    if (req.body.account.signature === undefined) {
      const messageToSignUuid = uuidv4();

      await common.dbClient.updateAccountSignMessage(
        account._id,
        messageToSignUuid
      );

      res.status(200).json({ messageToSign: messageToSignUuid });
    }

    const signer = EthCrypto.recover(
      req.body.account.signature,
      EthCrypto.hash.keccak256(account.signMessage) // signed message hash
    );

    if (
      req.body.account.username.toLowerCase() ===
        account.username.toLowerCase() &&
      signer.toLowerCase() === account.username.toLowerCase()
    ) {
      account.token = account.generateJWT();
      return res.json({ account: account.toAuthJSON() });
    } else {
      return res.status(422).json({ msg: "Not authorized" });
    }
  },

  myAccount: async (req, res, next) => {
    let payloadId = req.payload.id;

    // We have a new account
    if (req.payload.oauthId !== undefined) {
      let ownerAccount = {
        account: {
          username: req.payload.username,
          oauthId: req.payload.oauthId,
          firstname: "-",
          lastname: "-",
          accounttype: "Owner",
          email: /\S+@\S+\.\S+/.test(req.payload.username)
            ? req.payload.username
            : `${req.payload.username}@${req.payload.username}.com`,
          phoneNumber: req.payload.phoneNumber,
          organization: "-",
        },
      };

      const permanentArchiveNumber = await permanent.createArchive(
        req.payload.username
      );

      // Setting DID from new owner account oauth side
      const did = {
        address: req.payload.didAddress,
        publicEncryptionKey: req.payload.didPublicEncryptionKey,
      };

      let account;
      let profileImage = undefined;

      if (ownerAccount.account.username === "owner") {
        profileImage = "sally.png";
        ownerAccount.account.firstname = "Sally";
        ownerAccount.account.lastname = "Owner";
      }

      try {
        account = await common.dbClient.createAccount(
          ownerAccount.account,
          did,
          permanentArchiveNumber,
          profileImage
        );

        payloadId = account._id;
      } catch (error) {
        console.log("Account Save Error");
        console.log(error);
        return res.status(500).json({ msg: error });
      }
    }

    const account = await common.dbClient.getAllAccountInfoById(payloadId);

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
      coreFeatures: coreFeatures,
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

    let shareRequests = await common.dbClient.getShareRequests(accountId);
    // NOTE: need some additional information about the document like valid until, is notarized
    const account = await common.dbClient.getAllAccountInfoById(accountId);
    shareRequests = shareRequests.map((sr) => {
      const sr2 = sr.toObject();
      const doc = account.documents.find(
        (doc1) => doc1.type === sr.documentType
      );
      sr2.validUntilDate =
        doc && doc.validUntilDate ? doc.validUntilDate : undefined;
      sr2.vcJwt = doc && doc.vcJwt ? doc.vcJwt : undefined;
      sr2.vpDocumentDidAddress =
        doc && doc.vpDocumentDidAddress ? doc.vpDocumentDidAddress : undefined;
      return sr2;
    });
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
    let payload;

    if (req.params.imageurl === "anon-user.png") {
      payload = fs.createReadStream("./assets/anon-user.png");
    } else if (req.params.imageurl === "sally.png") {
      payload = fs.createReadStream("./assets/sally.png");
    } else if (req.params.imageurl === "billy.png") {
      payload = fs.createReadStream("./assets/billy.png");
    } else if (req.params.imageurl === "karen.png") {
      payload = fs.createReadStream("./assets/karen.png");
    } else if (req.params.imageurl === "josh.png") {
      payload = fs.createReadStream("./assets/josh.png");
    } else {
      payload = await documentStorageHelper.getDocumentBytes(
        req.params.imageurl,
        "profile-image"
      );
    }

    payload.pipe(res);
  },

  getImage: async (req, res, next) => {
    let payload;
    payload = await documentStorageHelper.getDocumentBytes(
      req.params.imageurl,
      "profile-image"
    );

    payload.pipe(res);
  },

  newShareRequest: async (req, res, next) => {
    let accountId = req.payload.id;
    const file =
      req.files && req.files.img && req.files.img[0]
        ? req.files.img[0]
        : undefined;
    const thumbnailFile =
      req.files && req.files.img && req.files.img[1]
        ? req.files.img[1]
        : undefined;

    let fromAccountId = req.body.fromAccountId;
    const toAccountId = req.body.toAccountId;
    const documentTypeName = req.body.documentType;

    let authorized = false;

    accountId = "" + accountId;
    fromAccountId = "" + fromAccountId;

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
    let key;
    let thumbnailKey;

    if (accountId == fromAccountId) {
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
    const account = await common.dbClient.getAllAccountInfoById(req.payload.id);
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
    const shareRequestAccountOwnerId = req.payload.id;
    await common.dbClient.deleteShareRequest(
      shareRequestAccountOwnerId,
      shareRequestId
    );
    res.status(200).json({ message: "success" });
  },
};
