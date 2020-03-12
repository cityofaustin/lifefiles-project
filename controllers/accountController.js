const common = require("../common/common");
const permanent = require("../common/permanentClient");
const passport = require("passport");

module.exports = {
  getAcccount: async (req, res, next) => {
    const account = await common.dbClient.getAllAccountInfoById(req.payload.id);
    res.status(200).json({ account: account.toAuthJSON() });
  },

  getAcccounts: async (req, res, next) => {
    const accounts = await common.dbClient.getAllAccounts();
    res.status(200).json(accounts);
  },

  newAccount: async (req, res, next) => {
    const permanentArchiveNumber = await permanent.createArchive(
      req.body.account.email
    );
    const did = await common.blockchainClient.createNewDID();

    const account = await common.dbClient.createAccount(
      req.body.account,
      did,
      permanentArchiveNumber
    );

    return res.status(201).json({ account: account.toAuthJSON() });
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
    const shareRequests = await common.dbClient.getShareRequests(
      req.params.accountId
    );

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

  newShareRequest: async (req, res, next) => {
    const accountRequestingId = req.payload.id;
    const accountId = req.body.shareRequest.accountId;
    const documentTypeName = req.body.shareRequest.documentType;

    const shareRequest = await common.dbClient.createShareRequest(
      accountRequestingId,
      accountId,
      documentTypeName
    );

    res.status(200).json(shareRequest);
  },

  approveOrDenyShareRequest: async (req, res, next) => {
    const shareRequestId = req.body.shareRequestId;
    const approved = req.body.approved;

    const shareRequest = await common.dbClient.approveOrDenyShareRequest(
      shareRequestId,
      approved
    );

    res.status(200).json(shareRequest);
  }
};
