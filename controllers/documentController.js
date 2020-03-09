const common = require("../common/common");
const documentStorageHelper = require("../common/documentStorageHelper");

module.exports = {
  uploadDocument: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const document = await common.dbClient.uploadDocument(
      account,
      account,
      req.file,
      req.body.type
    );
    res.status(200).json({ file: document.url });
  },

  uploadDocumentOnBehalfOfUser: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    let sealMD5 = req.files[1].md5;

    if (sealMD5 === undefined) {
      let etag = req.files[1].etag;
      etag = etag.replace(/\"/g, "");
      sealMD5 = etag;
    }

    const uploadForAccount = await common.dbClient.getAccountById(
      req.body.uploadForAccountId
    );

    const document = await common.dbClient.uploadDocument(
      account,
      uploadForAccount,
      req.files[0],
      req.body.type
    );

    // const issueTime = 1562950282;
    const issueTime = Math.floor(Date.now() / 1000);
    const vcJwt = await common.blockchainClient.createVC(
      account.didAddress,
      account.didPrivateKey,
      uploadForAccount.didAddress,
      document.did,
      req.body.type,
      document.hash,
      document.url,
      sealMD5,
      req.body.notarizationType,
      req.body.notaryInfo,
      req.body.ownerSignature,
      req.body.pem,
      issueTime
    );

    const vpJwt = await common.blockchainClient.createVP(
      account.didAddress,
      account.didPrivateKey,
      vcJwt
    );

    const verifiedVC = await common.blockchainClient.verifyVC(vcJwt);
    const verifiedVP = await common.blockchainClient.verifyVP(vpJwt);

    console.log("\n\nVERIFIED VC:\n");
    console.log(verifiedVC);
    console.log("\n\nVERIFIED VP:\n");
    console.log(verifiedVP);

    await common.dbClient.createVerifiableCredential(
      vcJwt,
      JSON.stringify(verifiedVC),
      account,
      document
    );

    await common.dbClient.createVerifiablePresentation(
      vpJwt,
      JSON.stringify(verifiedVP),
      account,
      document
    );

    res.status(200).json({
      vc: verifiedVC,
      vp: verifiedVP
    });
  },

  getDocuments: async (req, res, next) => {
    const accountId = req.payload.id;
    const documents = await common.dbClient.getDocuments(accountId);

    res.status(200).json({ documents: documents });
  },

  getDocument: async (req, res, next) => {
    const accountId = req.payload.id;
    const filename = req.params.filename;
    let approved = false;

    const document = await common.dbClient.getDocument(filename);

    if (document === undefined || document === null) {
      res.status(404).json({
        error: "Document Does Not Exists"
      });
      return;
    }

    for (let sharedWithAccountId of document.sharedWithAccountIds) {
      if (sharedWithAccountId === accountId) {
        approved = true;
      }
    }

    if (document.belongsTo == accountId || approved === true) {
      const payload = await documentStorageHelper.getDocumentBytes(filename);
      if (payload.error !== undefined) {
        res.status(404).json({
          error: payload.error
        });
      } else {
        payload.pipe(res);
      }
    } else {
      res.status(403).json({
        error: "Account not authorized to view this document"
      });
    }
  },

  deleteDocument: async (req, res, next) => {
    const filename = req.params.filename;
    let deletedDocument = await common.dbClient.deleteDocument(filename);
    await documentStorageHelper.deleteDocumentBytes(filename);

    await common.dbClient.deleteShareRequestByDocumentId(deletedDocument._id);

    res.status(200).json({ message: "success" });
  },

  getDocumentTypes: async (req, res, next) => {
    const documentTypes = await common.dbClient.getAllDocumentTypes();
    res.status(200).json({ documentTypes: documentTypes });
  }
};
