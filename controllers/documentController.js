const common = require("../common/common");

module.exports = {
  uploadDocument: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const document = await common.dbClient.uploadDocument(account, account, req.file, req.body.type);
    res.status(200).json({ file: document.url });
  },

  uploadDocumentOnBehalfOfUser: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const uploadForAccount = await common.dbClient.getAccountById(req.body.uploadForAccountId);
    const document = await common.dbClient.uploadDocument(account, uploadForAccount, req.file);

    // const issueTime = 1562950282;
    const issueTime = Math.floor(Date.now() / 1000);

    const vcJwt = await common.blockchainClient.createVC(account.didAddress, account.didPrivateKey, document.did, issueTime, document.hash);

    const vpJwt = await common.blockchainClient.createVP(account.didAddress, account.didPrivateKey, vcJwt);

    const verifiedVC = await common.blockchainClient.verifyVC(vcJwt);
    const verifiedVP = await common.blockchainClient.verifyVP(vpJwt);

    console.log("\n\nVERIFIED VC:\n");
    console.log(verifiedVC);

    console.log("\n\nVERIFIED VP:\n");
    console.log(verifiedVP);

    await common.dbClient.createVerifiableCredential(vcJwt, JSON.stringify(verifiedVC), account, document);

    await common.dbClient.createVerifiablePresentation(vpJwt, JSON.stringify(verifiedVP), account, document);

    res.status(200).json({ file: document.url });
  },

  getDocuments: async (req, res, next) => {
    const accountId = req.payload.id;
    const documents = await common.dbClient.getDocuments(accountId);

    res.status(200).json({ documents: documents });
  },

  getDocument: async (req, res, next) => {
    const filename = req.params.filename;
    let payload = await common.dbClient.getDocument(filename);
    if (payload.error !== undefined) {
      res.status(404).json({
        error: payload.error
      });
    } else {
      payload.pipe(res);
    }
  },

  deleteDocument: async (req, res, next) => {
    const filename = req.params.filename;
    await common.dbClient.deleteDocument(filename);
    res.status(200).json({ message: "success" });
  },

  getDocumentTypes: async (req, res, next) => {
    const documentTypes = await common.dbClient.getAllDocumentTypes();
    res.status(200).json({ documentTypes: documentTypes });
  }
};
