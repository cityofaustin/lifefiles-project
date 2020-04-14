const common = require("../common/common");
const documentStorageHelper = require("../common/documentStorageHelper");
const documentNotarization = require("../common/documentNotarization");
const permanent = require("../common/permanentClient");
const secureKeyStorage = require("../common/secureKeyStorage");

module.exports = {
  updateDocument: async (req, res, next) => {
    const documentId = req.params.documentId;
    const account = await common.dbClient.getAccountById(req.payload.id);
    const document = await common.dbClient.getDocumentById(documentId);

    if (!document.belongsTo._id.equals(account._id)) {
      res.status(403).json({
        error: "Account not authorized update this document",
      });
      return;
    }

    let md5 = document.hash;
    let filename = document.name;
    let permanentOrgFileArchiveNumber = document.permanentOrgFileArchiveNumber;
    let key = document.url;
    let validuntildate = req.body.validuntildate || document.validUntilDate;

    if (
      req.files !== undefined &&
      req.files !== null &&
      req.files.img !== undefined
    ) {
      const newFile = req.files.img;
      filename = newFile.name;
      md5 = newFile.md5;
      key = await documentStorageHelper.upload(newFile, "document");

      permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
        newFile,
        key,
        account.permanentOrgArchiveNumber
      );
    }

    const updatedDocument = await common.dbClient.updateDocument(
      documentId,
      filename,
      key,
      permanentOrgFileArchiveNumber,
      md5,
      validuntildate
    );

    res.status(200).json({ updatedDocument: updatedDocument.toPublicInfo() });
  },

  uploadDocument: async (req, res, next) => {
    if (req.files === undefined || req.files.img === undefined) {
      res.status(501).json({
        error: "Must include a file to upload.",
      });
      return;
    }

    if (req.body.type === undefined) {
      res.status(501).json({
        error:
          "Document Type Does Not Exist!, Must be of type: Passport, Birth Certificate...",
      });
      return;
    }

    const account = await common.dbClient.getAccountById(req.payload.id);
    const file = req.files.img;

    let key = await documentStorageHelper.upload(file, "document");

    let permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
      file,
      key,
      account.permanentOrgArchiveNumber
    );

    const document = await common.dbClient.createDocument(
      account,
      account,
      file.name,
      key,
      req.body.type,
      permanentOrgFileArchiveNumber,
      file.md5,
      req.body.validuntildate,
      req.body.encryptionPubKey
    );

    // fullUrl: "http://" + ip.address() +":" + (process.env.PORT || 5000) + "/api/documents/" + document.url + "/" + account.generateJWT()

    res
      .status(200)
      .json({ file: document.url, document: document.toPublicInfo() });
  },

  uploadDocumentOnBehalfOfUser: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);

    const uploadForAccount = await common.dbClient.getAccountById(
      req.body.uploadForAccountId
    );

    const uploadOnBehalfOfFile = req.files.img[0];
    const notarySealFile = req.files.img[1];

    let key = await documentStorageHelper.upload(
      uploadOnBehalfOfFile,
      "document"
    );

    let permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
      uploadOnBehalfOfFile,
      key,
      uploadForAccount.permanentOrgArchiveNumber
    );

    const document = await common.dbClient.createDocument(
      account,
      uploadForAccount,
      uploadOnBehalfOfFile.name,
      key,
      req.body.type,
      permanentOrgFileArchiveNumber,
      uploadOnBehalfOfFile.md5,
      req.body.validuntildate
    );

    // Approve share request so person who uploaded it on behalf can have access
    let shareRequest = await common.dbClient.createShareRequest(
      account._id,
      uploadForAccount._id,
      req.body.type
    );

    await common.dbClient.approveOrDenyShareRequest(shareRequest._id, true);

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
      notarySealFile.md5,
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
      vp: verifiedVP,
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
        error: "Document Does Not Exists",
      });
      return;
    }

    for (let sharedWithAccountId of document.sharedWithAccountIds) {
      if (sharedWithAccountId === accountId) {
        approved = true;
      }
    }

    if (document.belongsTo == accountId || approved === true) {
      const payload = await documentStorageHelper.getDocumentBytes(
        filename,
        "document"
      );
      if (payload.error !== undefined) {
        res.status(404).json({
          error: payload.error,
        });
      } else {
        payload.pipe(res);
      }
    } else {
      res.status(403).json({
        error: "Account not authorized to view this document",
      });
    }
  },

  deleteDocument: async (req, res, next) => {
    const filename = req.params.filename;
    let deletedDocument = await common.dbClient.deleteDocument(filename);
    await documentStorageHelper.deleteDocumentBytes(filename, "document");

    await common.dbClient.deleteShareRequestByDocumentId(deletedDocument._id);

    res.status(200).json({ message: "success" });
  },

  getDocumentTypes: async (req, res, next) => {
    const documentTypes = await common.dbClient.getAllDocumentTypes();
    res.status(200).json({ documentTypes: documentTypes });
  },

  createNotarizedDocument: async (req, res, next) => {
    const notaryAccount = await common.dbClient.getAccountById(req.payload.id);
    const ownerAccount = await common.dbClient.getAccountById(
      req.body.ownerAccountId
    );

    const documentType = req.body.type;
    const did = await common.blockchainClient.createNewDID();

    const documentDID = "did:ethr:" + did.address;
    const issueTime = Math.floor(Date.now() / 1000);
    const issuanceDate = Date.now();
    const expirationDate = new Date(req.body.expirationDate);
    const validityTimeSeconds = Math.round(
      (expirationDate - new Date()) / 1000
    );
    let notaryName = notaryAccount.firstName + notaryAccount.lastName;
    notaryName = notaryName.replace(/\s/g, "");
    const notaryId = "" + req.body.notaryId;

    let fileInfo = await documentNotarization.createNotarizedDocument(
      req.files.img[0],
      req.files.img[1],
      req.files.img[2],
      documentDID
    );

    let s3FileRequst = {
      name: "notarizedDocument.pdf",
      tempFilePath: fileInfo.filename,
    };

    let key = await documentStorageHelper.upload(s3FileRequst, "document");

    const document = await common.dbClient.createDocument(
      notaryAccount,
      ownerAccount,
      req.files.img[0].name +
        "-" +
        req.files.img[1].name +
        "-" +
        req.files.img[2].name,
      key,
      "Notarized " + documentType,
      "",
      fileInfo.md5,
      expirationDate,
      ""
    );

    let notaryPrivateKey = await secureKeyStorage.retrieve(
      notaryAccount.didPrivateKeyGuid
    );

    let notarizedVCJwt = await common.blockchainClient.createNotarizedVC(
      notaryAccount.didAddress,
      notaryPrivateKey,
      ownerAccount.didAddress,
      documentDID,
      documentType,
      fileInfo.md5,
      issueTime,
      issuanceDate,
      expirationDate,
      notaryName,
      notaryId
    );

    common.blockchainClient.storeJwtOnEthereumBlockchain(
      notarizedVCJwt,
      did,
      validityTimeSeconds
    );

    const verifiedVC = await common.blockchainClient.verifyVC(notarizedVCJwt);

    await common.dbClient.createVerifiableCredential(
      notarizedVCJwt,
      JSON.stringify(verifiedVC),
      ownerAccount,
      document,
      did.privateKey
    );

    res.status(200).json({
      vc: notarizedVCJwt,
      verifiedVC: verifiedVC,
      document: document.toPublicInfo(),
      didStatus: "https://etherscan.io/address/" + did.address,
    });
  },
};
