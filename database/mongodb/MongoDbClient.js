const mongoose = require("mongoose");
const EthCrypto = require("eth-crypto");
const secureKeyStorage = require("../../common/secureKeyStorage");

const Account = require("./models/Account");
const Document = require("./models/Document");
const DocumentType = require("./models/DocumentType");
const Role = require("./models/Role");
const Permission = require("./models/Permission");
const ShareRequest = require("./models/ShareRequest");
const RolePermissionTable = require("./models/RolePermissionTable");
const VerifiableCredential = require("./models/VerifiableCredential");
const VerifiablePresentation = require("./models/VerifiablePresentation");

let mongoDbOptions = {
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
    const accounts = await this.getAllAccounts();
    const documentTypes = await this.getAllDocumentTypes();

    if (accounts.length === 0) {
      console.log("\nAccounts are empty. Populating default values...");

      // Sally
      let ownerAccount = {
        account: {
          username: "SallyOwner",
          firstname: "Sally",
          lastname: "Owner",
          password: "owner",
          role: "owner",
          email: "owner@owner.com",
          phonenumber: "555-555-5555",
          organization: "-",
        },
      };
      let ownerDid = {
        did: {
          address: "0x6efedeaec20e79071251fffa655F1bdDCa65c027",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "d28678b5d893ea7accd58901274dc5df8eb00bc76671dbf57ab65ee44c848415"
          ),
          privateKey:
            "d28678b5d893ea7accd58901274dc5df8eb00bc76671dbf57ab65ee44c848415",
          privateKeyGuid: "5663aaf5-2b94-4854-a862-07a7fe75e400",
        },
      };

      await secureKeyStorage.store(
        ownerDid.did.privateKeyGuid,
        ownerDid.did.privateKey
      );

      this.createAccount(
        ownerAccount.account,
        ownerDid.did,
        "06fz-0000",
        "sally.png"
      );

      // Billy
      let caseWorkerAccount = {
        account: {
          username: "BillyCaseWorker",
          firstname: "Billy",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "caseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Banana Org",
        },
      };
      let caseWorkerDid = {
        did: {
          address: "0x2a6F1D5083fb19b9f2C653B598abCb5705eD0439",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "8ef83de6f0ccf32798f8afcd436936870af619511f2385e8aace87729e771a8b"
          ),
          privateKey:
            "8ef83de6f0ccf32798f8afcd436936870af619511f2385e8aace87729e771a8b",
          privateKeyGuid: "53d9269b-a90b-423e-be17-e2a6517790b1",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDid.did.privateKeyGuid,
        caseWorkerDid.did.privateKey
      );

      this.createAccount(
        caseWorkerAccount.account,
        caseWorkerDid.did,
        "06fy-0000",
        "billy.png"
      );

      // Karen
      let caseWorkerAccountTwo = {
        account: {
          username: "KarenCaseWorker",
          firstname: "Karen",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "karencaseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Apple Org",
        },
      };
      let caseWorkerDidTwo = {
        did: {
          address: "0x0F4FBead5219388CD71FAa2bbd63C26Aad0ae2c5",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "403c9b0e55db5ff1434d07711baa34d76eecc2723cdb599a42f5f2cbf6fd3262"
          ),
          privateKey:
            "403c9b0e55db5ff1434d07711baa34d76eecc2723cdb599a42f5f2cbf6fd3262",
          privateKeyGuid: "6ee64b8e-0623-4cad-8162-26e49e74b2dc",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDidTwo.did.privateKeyGuid,
        caseWorkerDidTwo.did.privateKey
      );

      this.createAccount(
        caseWorkerAccountTwo.account,
        caseWorkerDidTwo.did,
        "06fy-0000",
        "karen.png"
      );

      // Josh
      let caseWorkerAccountThree = {
        account: {
          username: "JoshCaseWorker",
          firstname: "Josh",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "joshcaseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Pear Org",
        },
      };
      let caseWorkerDidThree = {
        did: {
          address: "0x56bf6887202d8aa6Df4Bc312e866E955FE0FC9aD",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "a2bf1a07ccb785b7baf041dc0135ae9bfbf049bd36068777e4796185fe1ff5c0"
          ),
          privateKey:
            "a2bf1a07ccb785b7baf041dc0135ae9bfbf049bd36068777e4796185fe1ff5c0",
          privateKeyGuid: "22161991-55f9-45fc-b6c5-de8e339701f1",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDidThree.did.privateKeyGuid,
        caseWorkerDidThree.did.privateKey
      );

      this.createAccount(
        caseWorkerAccountThree.account,
        caseWorkerDidThree.did,
        "06fy-0000",
        "josh.png"
      );
    }

    if (documentTypes.length === 0) {
      console.log("\nDocumentTypes are empty. Populating default values...");
      let records = [
        "Driver's License",
        "Birth Certificate",
        "MAP Card",
        "Medical Records",
        "Social Security Card",
        "Passport",
        "Marriage Certificate",
      ];
      for (let record of records) {
        let fields = [
          { fieldName: "name", required: true },
          { fieldName: "dateofbirth", required: false },
        ];

        this.createDocumentType({ name: record, fields: fields });
      }
    }
  }

  // Cache
  async updateRolePermissionsTableCache() {
    this.cachedRolePermissionTable = await this.getLatestRolePermissionTable();
  }

  getCachedRolePermissionsTable() {
    return this.cachedRolePermissionTable;
  }

  // Accounts
  async getAccountById(id) {
    const account = await Account.findById(id);
    return account;
  }

  async getAllAccountInfoById(id) {
    const account = await Account.findById(id).populate([
      "documents",
      "shareRequests",
    ]);
    return account;
  }

  async getAllAccounts() {
    const accounts = await Account.find({});
    return accounts;
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
    newAccount.role = accountReq.role;
    newAccount.phoneNumber = accountReq.phonenumber;
    newAccount.organization = accountReq.organization;
    newAccount.permanentOrgArchiveNumber = permanentOrgArchiveNumber;

    newAccount.didAddress = did.address;
    newAccount.didPublicEncryptionKey = did.publicEncryptionKey;
    newAccount.didPrivateKeyGuid = did.privateKeyGuid;
    newAccount.profileImageUrl = profileImageUrl;
    newAccount.setPassword(accountReq.password);

    const savedAccount = await newAccount.save();
    return savedAccount;
  }

  async updateAccount(accountId, profileImageUrl) {
    const account = await Account.findById(accountId);
    account.profileImageUrl = profileImageUrl;
    await account.save();
    return account;
  }

  async getShareRequests(accountId) {
    const account = await Account.findById(accountId).populate({
      path: "shareRequests",
    });

    return account.shareRequests;
  }

  async getShareRequestByUrl(url) {
    let shareRequest = await ShareRequest.findOne({
      $or: [{ documentUrl: url }, { documentThumbnailUrl: url }],
    });
    return shareRequest;
  }

  async deleteShareRequestByDocumentId(documentId) {
    await ShareRequest.deleteMany({
      documentId: documentId,
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
  async createShareRequest(accountRequestingId, accountId, documentTypeName) {
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

  // Document Types
  async getAllDocumentTypes() {
    const documentTypes = await DocumentType.find({});
    return documentTypes;
  }

  async createDocumentType(documentType) {
    const newDocumentType = new DocumentType();
    newDocumentType.name = documentType.name;
    for (let field of documentType.fields) {
      newDocumentType.fields.push(field);
    }
    const documentTypeSaved = await newDocumentType.save();
    return documentTypeSaved;
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
    encryptionPubKey
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
    validUntilDate
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
