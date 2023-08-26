const common = require("../common/common");
const documentStorageHelper = require("../common/documentStorageHelper");
const permanent = require("../common/permanentClient");
const secureKeyStorage = require("../common/secureKeyStorage");
const EthCrypto = require("eth-crypto");

module.exports = {
  updateDocument: async (req, res, next) => {
    const documentId = req.params.documentId;
    const account = await common.dbClient.getAccountById(req.payload.id);
    const document = await common.dbClient.getDocumentById(documentId);

    if (!document.belongsTo._id.equals(account._id)) {
      // not owner
      let isAllowed = false;
      let sharedRequest = await common.dbClient.getShareRequestsBySharedWith(
        account._id
      );
      sharedRequest = sharedRequest.find(
        (sr) => sr.documentType === document.type
      );
      if (sharedRequest.shareWithAccountId) {
        if (sharedRequest.canReplace) {
          isAllowed = true;
        }
      }
      // helper but not on share request or not allowed to update.
      if (!isAllowed) {
        console.log("Account not authorized update this document");
        res.status(403).json({
          error: "Account not authorized update this document",
        });
        return;
      }
    }

    let md5 = document.hash;
    let filename = document.name;
    let permanentOrgFileArchiveNumber = document.permanentOrgFileArchiveNumber;
    let key = document.url;
    let thumbnailKey = document.thumbnailUrl;
    let validuntildate = req.body.validuntildate || document.validUntilDate;
    let claimed = req.body.claimed || document.claimed;

    if (
      req.files !== undefined &&
      req.files !== null &&
      req.files.img !== undefined
    ) {
      const newFile =
        req.files.img[0] === undefined ? req.files.img : req.files.img[0];

      const newThumbnailFile =
        req.files.img[1] === undefined ? undefined : req.files.img[1];

      filename = newFile.name;
      md5 = newFile.md5;
      key = await documentStorageHelper.upload(newFile, "document");

      permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
        newFile,
        key,
        account.permanentOrgArchiveNumber
      );

      if (newThumbnailFile) {
        thumbnailKey =
          newThumbnailFile === undefined
            ? undefined
            : await documentStorageHelper.upload(newThumbnailFile, "document");
      }
    }

    const updatedDocument = await common.dbClient.updateDocument(
      documentId,
      filename,
      key,
      thumbnailKey,
      permanentOrgFileArchiveNumber,
      md5,
      validuntildate,
      claimed
    );

    res.status(200).json({ updatedDocument: updatedDocument.toPublicInfo() });
  },

  uploadDocument: async (req, res, next) => {
    if (
      req.files === undefined ||
      req.files === null ||
      req.files.img === undefined
    ) {
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

    const file =
      req.files.img[0] === undefined ? req.files.img : req.files.img[0];

    const thumbnailFile =
      req.files.img[1] === undefined ? undefined : req.files.img[1];

    const key = await documentStorageHelper.upload(file, "document");
    const thumbnailKey =
      thumbnailFile === undefined
        ? undefined
        : await documentStorageHelper.upload(thumbnailFile, "document");

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
      thumbnailKey,
      req.body.type,
      permanentOrgFileArchiveNumber,
      file.md5,
      req.body.validuntildate,
      req.body.encryptionPubKey
    );

    res.status(200).json({
      file: document.url,
      thumbnailUrl: document.thumbnailUrl,
      document: document.toPublicInfo(),
    });
  },

  uploadDocumentOnBehalfOfUser: async (req, res, next) => {
    if (
      req.files === undefined ||
      req.files === null ||
      req.files.img.length !== 4
    ) {
      res.status(501).json({
        error: "Must include files to upload.",
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

    if (req.body.uploadForAccountId === undefined) {
      res.status(501).json({
        error: "Must include accountId that you are uploading on behalf",
      });
    }

    const account = await common.dbClient.getAccountById(req.payload.id);
    const uploadForAccount = await common.dbClient.getAccountById(
      req.body.uploadForAccountId
    );

    const documentFile = req.files.img[0];

    const documentThumbnailFile = req.files.img[1];

    const documentForAccountFile = req.files.img[2];

    const documentForAccountThumbnailFile = req.files.img[3];

    const key = await documentStorageHelper.upload(documentFile, "document");
    const thumbnailKey = await documentStorageHelper.upload(
      documentThumbnailFile,
      "document"
    );

    let permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
      documentForAccountFile,
      key,
      uploadForAccount.permanentOrgArchiveNumber
    );

    const keyForAccount = await documentStorageHelper.upload(
      documentForAccountFile,
      "document"
    );
    const thumbnailKeyForAccount = await documentStorageHelper.upload(
      documentForAccountThumbnailFile,
      "document"
    );

    const document = await common.dbClient.createDocument(
      uploadForAccount,
      uploadForAccount,
      documentForAccountFile.name,
      keyForAccount,
      thumbnailKeyForAccount,
      req.body.type,
      permanentOrgFileArchiveNumber,
      documentForAccountFile.md5,
      req.body.validuntildate,
      req.body.encryptionPubKey,
      false
    );

    let shareRequest = await common.dbClient.createShareRequest(
      account._id,
      uploadForAccount._id,
      req.body.type
    );

    shareRequest = await common.dbClient.approveOrDenyShareRequest(
      shareRequest._id,
      true,
      key,
      thumbnailKey
    );

    res.status(200).json({
      file: document.url,
      shareRequest: shareRequest,
      thumbnailUrl: document.thumbnailUrl,
      document: document.toPublicInfo(),
    });
  },

  getDocuments: async (req, res, next) => {
    const accountId = req.payload.id;
    const documents = await common.dbClient.getDocuments(accountId);

    res.status(200).json({ documents: documents });
  },

  getDocumentByShareRequest: async (req, res, next) => {
    const { shareRequestId } = { ...req.params };
    const shareRequest = await common.dbClient.getShareRequestById(
      shareRequestId
    );
    const account = await common.dbClient.getAccountByShareRequest(
      shareRequestId
    );
    const document = await common.dbClient.getDocumentByDocumentType(
      account._id.toString(),
      shareRequest.documentType
    );
    res.status(200).json({ document });
  },

  getDocument: async (req, res, next) => {
    let accountId = req.payload.id;
    accountId = accountId._id ? accountId.toString() : accountId;
    const filename = req.params.filename;
    let approved = false;
    let shareRequest;
    const document = await common.dbClient.getDocument(filename);

    if (document === undefined || document === null) {
      shareRequest = await common.dbClient.getShareRequestByUrl(filename);
    }

    if (
      (document === undefined || document === null) &&
      (shareRequest === undefined || shareRequest === null)
    ) {
      res.status(404).json({
        error: "Document Does Not Exists",
      });
      return;
    }

    if (
      shareRequest !== undefined &&
      shareRequest !== null &&
      shareRequest.shareWithAccountId === accountId
    ) {
      approved = true;
    }

    if (
      approved === true ||
      (document && document.belongsTo.equals(accountId))
    ) {
      const payload = await documentStorageHelper.getDocumentBytes(
        filename,
        "document"
      );
      if (!payload) {
        return res.status(404).json({ error: "Failed to get file" });
      }
      if (payload?.error !== undefined) {
        res.status(404).json({
          error: payload.error,
        });
      } else {
        payload.pipe(res);
      }
    } else {
      console.log("Account not authorized to view this document");
      res.status(403).json({
        error: "Account not authorized to view this document",
      });
    }
  },

  deleteDocument: async (req, res, next) => {
    const filename = req.params.filename;
    let deletedDocument = await common.dbClient.deleteDocument(filename);
    await documentStorageHelper.deleteDocumentBytes(filename, "document");

    await common.dbClient.deleteShareRequestByDocumentId(deletedDocument.type);

    res.status(200).json({ message: "success" });
  },

  getDocumentTypes: async (req, res, next) => {
    const documentTypes = await common.dbClient.getAllDocumentTypes();
    res.status(200).json({ documentTypes: documentTypes });
  },

  getTxtRecord: async (req, res, next) => {
    let txtRecord = await common.blockchainClient.getTxtRecord(
      req.params.recordId
    );

    res.status(200).json({ txtRecord: txtRecord });
  },

  generateNewDid: async (req, res) => {
    const did = await common.blockchainClient.createNewDID();
    await secureKeyStorage.storeToDb(did.address, did.privateKey);
    res.status(200).json({ didAddress: did.address });
  },

  updateDocumentVcJwt: async (req, res) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const vc = req.body.vc;
    const network = req.body.network;

    const vcUnpacked = await common.blockchainClient.verifyVC(vc);
    const vpDocumentDidAddress =
      vcUnpacked.payload.vc.verifiablePresentationReference.id.split(":")[2];

    let filename;
    let key;
    let permanentOrgFileArchiveNumber;
    let md5;
    let keyForAccount;
    const accountForId = req.params.accountForId;
    const documentType = req.params.documentType;
    // const { accountForId, documentType } = { ...req.params };

    const document = await common.dbClient.getDocumentByDocumentType(
      accountForId,
      documentType
    );

    if (
      req.files !== undefined &&
      req.files !== null &&
      req.files.img.length === 2
    ) {
      const newCaseWorkerFile = req.files.img[0];
      const newOwnerFile = req.files.img[1];

      filename = newOwnerFile.name;
      md5 = newOwnerFile.md5;
      key = await documentStorageHelper.upload(newOwnerFile, "document");

      permanentOrgFileArchiveNumber = await permanent.addToPermanentArchive(
        newOwnerFile,
        key,
        account.permanentOrgArchiveNumber
      );

      keyForAccount = await documentStorageHelper.upload(
        newCaseWorkerFile,
        "document"
      );
    }

    const updatedDocument = await common.dbClient.updateDocumentVC(
      document._id,
      vc,
      vpDocumentDidAddress,
      filename,
      key,
      permanentOrgFileArchiveNumber,
      md5,
      account.id,
      keyForAccount
    );

    if (vc !== undefined) {
      // Anchor VC to chain
      const now = new Date();
      // const vpUnpacked = await common.blockchainClient.verifyVP(req.body.vpJwt);
      // const vcJwt = vpUnpacked.payload.vp.verifiableCredential[0];
      // const vcUnpacked = await common.blockchainClient.verifyVC(vc);
      const documentDidAddress = vcUnpacked.payload.vc.id.split(":")[2];

      const expirationDate = new Date(vcUnpacked.payload.vc.expirationDate);
      const validityTimeSeconds = Math.round((expirationDate - now) / 1000);

      const documentDidPrivateKey = await secureKeyStorage.retrieveFromDb(
        documentDidAddress
      );

      let didUrl = "";

      if (network === "eth") {
        common.blockchainClient.storeDataOnEthereumBlockchain(
          documentDidAddress,
          documentDidPrivateKey,
          validityTimeSeconds,
          vc
        );
        didUrl = "https://etherscan.io/address/" + documentDidAddress;
      } else if (network === "rsk") {
        common.rskClient.storeDataOnRskBlockchain(
          documentDidAddress,
          documentDidPrivateKey,
          validityTimeSeconds,
          vc
        );
        didUrl = "https://explorer.rsk.co/address/" + documentDidAddress;
        console.log("Saving VC to RSK Network!");
        console.log(didUrl);
      } else {
        console.log("s3 Storage!");
        await documentStorageHelper.uploadPublicVCJwt(
          vc,
          "did:ethr:" + documentDidAddress + ".json",
          Math.round(now / 1000)
        );
        // eslint-disable-next-line
        didUrl = `https://${process.env.AWS_NOTARIZED_VPJWT_BUCKET_NAME}.s3.us-east-2.amazonaws.com/did%3Aethr%3A${documentDidAddress}.json`;
        console.log({ didUrl });
      }
    }

    res.status(200).json({ updatedDocument: updatedDocument.toPublicInfo() });
  },

  updateDocumentVpJwt: async (req, res) => {
    const vpJwt = req.body.vpJwt;
    const document = await common.dbClient.getDocumentByDocumentType(
      req.params.accountForId,
      req.params.documentType
    );

    const updatedDocument = await common.dbClient.updateDocumentVP(
      document._id,
      vpJwt
    );

    res.status(200).json({ updatedDocument: updatedDocument.toPublicInfo() });
  },

  anchorVpToBlockchain: async (req, res, next) => {
    const network = req.body.network;
    const now = new Date();
    const vpUnpacked = await common.blockchainClient.verifyVP(req.body.vpJwt);
    const vcJwt = vpUnpacked.payload.vp.verifiableCredential[0];
    const vcUnpacked = await common.blockchainClient.verifyVC(vcJwt);
    const documentDidAddress =
      vcUnpacked.payload.vc.verifiablePresentationReference.id.split(":")[2];

    const expirationDate = new Date(vcUnpacked.payload.vc.expirationDate);
    const validityTimeSeconds = Math.round((expirationDate - now) / 1000);

    const documentDidPrivateKey = await secureKeyStorage.retrieveFromDb(
      documentDidAddress
    );

    let didUrl = "";

    if (network === "eth") {
      common.blockchainClient.storeDataOnEthereumBlockchain(
        documentDidAddress,
        documentDidPrivateKey,
        validityTimeSeconds,
        req.body.vpJwt
      );
      didUrl = "https://etherscan.io/address/" + documentDidAddress;
    } else if (network === "rsk") {
      common.rskClient.storeDataOnRskBlockchain(
        documentDidAddress,
        documentDidPrivateKey,
        validityTimeSeconds,
        req.body.vpJwt
      );
      didUrl = "https://explorer.rsk.co/address/" + documentDidAddress;
    } else {
      await documentStorageHelper.uploadPublicVPJwt(
        req.body.vpJwt,
        "did:ethr:" + documentDidAddress + ".json",
        Math.round(now / 1000)
      );
      // eslint-disable-next-line
      didUrl = `https://${process.env.AWS_NOTARIZED_VPJWT_BUCKET_NAME}.s3.us-east-2.amazonaws.com/did%3Aethr%3A${documentDidAddress}.json`;
    }

    res.status(200).json({
      didStatus: didUrl,
    });
  },
};
