const mongoose = require("mongoose");
const grid = require("gridfs-stream");

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
  useCreateIndex: true
};

class MongoDbClient {
  constructor() {
    this.cachedRolePermissionTable = undefined;
    this.mongoURI = process.env.MONGODB_URI;

    this.fileConnection = mongoose.createConnection(
      this.mongoURI,
      mongoDbOptions
    );

    this.fileConnection.once("open", () => {
      this.gfs = grid(this.fileConnection.db, mongoose.mongo);
      this.gfs.collection("uploads");
    });

    mongoose.connect(this.mongoURI, mongoDbOptions).then(() => {
      this.populateDefaultValues();
      this.updateRolePermissionsTableCache();
    });
  }

  // DB initial setup
  async populateDefaultValues() {
    const accounts = await this.getAllAccounts();
    const documentTypes = await this.getAllDocumentTypes();

    if (accounts.length === 0) {
      console.log("\nAccounts are empty. Populating default values...");
      let ownerAccount = {
        account: {
          username: "SallyOwner",
          firstName: "Sally",
          lastName: "Owner",
          password: "owner",
          role: "owner",
          email: "owner@owner.com"
        }
      };
      let ownerDid = {
        did: {
          address: "0x6efedeaec20e79071251fffa655F1bdDCa65c027",
          privateKey:
            "d28678b5d893ea7accd58901274dc5df8eb00bc76671dbf57ab65ee44c848415"
        }
      };
      this.createAccount(
        ownerAccount.account,
        ownerDid.did,
        "06fz-0000",
        "anon-user.png"
      );

      let caseWorkerAccount = {
        account: {
          username: "BillyCaseWorker",
          firstName: "Billy",
          lastName: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "caseworker@caseworker.com"
        }
      };
      let caseWorkerDid = {
        did: {
          address: "0x2a6F1D5083fb19b9f2C653B598abCb5705eD0439",
          privateKey:
            "8ef83de6f0ccf32798f8afcd436936870af619511f2385e8aace87729e771a8b"
        }
      };
      this.createAccount(
        caseWorkerAccount.account,
        caseWorkerDid.did,
        "06fy-0000",
        "anon-user.png"
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
        "Marriage Certificate"
      ];
      for (let record of records) {
        let fields = [
          { fieldName: "name", required: true },
          { fieldName: "dateofbirth", required: false }
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
      "shareRequests"
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
    newAccount.permanentOrgArchiveNumber = permanentOrgArchiveNumber;
    newAccount.didAddress = did.address;
    newAccount.didPrivateKey = did.privateKey;
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
      path: "shareRequests"
    });

    return account.shareRequests;
  }

  async deleteShareRequestByDocumentId(documentId) {
    await ShareRequest.deleteMany({
      documentId: documentId
    });
    return;
  }

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

  async approveOrDenyShareRequest(shareRequestId, approved) {
    const shareRequest = await ShareRequest.findById(shareRequestId);
    shareRequest.approved = approved;

    await shareRequest.save();

    if (shareRequest.approved === true) {
      const document = await Document.findById(shareRequest.documentId);
      document.sharedWithAccountIds.push(shareRequest.shareWithAccountId);
      await document.save();
    }

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
    documentType,
    permanentOrgFileArchiveNumber,
    md5
  ) {
    const newDocument = new Document();
    newDocument.name = originalFileName;
    newDocument.url = fileKey;
    newDocument.uploadedBy = uploadedByAccount;
    newDocument.belongsTo = uploadForAccount;
    newDocument.type = documentType;
    newDocument.permanentOrgFileArchiveNumber = permanentOrgFileArchiveNumber;
    newDocument.hash = md5;
    await newDocument.save();

    uploadForAccount.documents.push(newDocument);
    await uploadForAccount.save();

    return newDocument;
  }

  async getDocuments(accountId) {
    const account = await Account.findById(accountId);

    let documents = await Document.find({
      _id: {
        $in: account.documents
      }
    });

    return documents;
  }

  async getDocument(filename) {
    let document = await Document.findOne({ url: filename });
    return document;
  }

  async getDocumentData(filename) {
    const payload = await this.getDocumentPromise(filename);
    return payload;
  }
  async deleteDocumentData(filename) {
    await this.deleteDocumentPromise(filename);
  }

  async deleteDocument(filename) {
    const document = await Document.findOneAndRemove({
      url: filename
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
  async createVerifiableCredential(vcJwt, verifiedVC, issuer, document) {
    const newVC = new VerifiableCredential();
    newVC.vcJwt = vcJwt;
    newVC.verifiedVC = verifiedVC;
    newVC.issuer = issuer;
    newVC.document = document;
    newVC.documentDid = document.did;
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

  async getDocumentPromise(filename) {
    return new Promise((resolve, reject) => {
      this.gfs.files.findOne({ filename: filename }, (err, file) => {
        if (!file || file.length === 0) {
          resolve({ error: "No file exists" });
        }
        let readstream;
        try {
          readstream = this.gfs.createReadStream(file.filename);
        } catch (e) {
          console.log({ error: e });
        }
        resolve(readstream);
      });
    });
  }

  async deleteDocumentPromise(filename) {
    return new Promise((resolve, reject) => {
      this.gfs.files.deleteOne({ filename: filename }, (err, file) => {
        if (!file || file.length === 0) {
          resolve({ error: "No file exists" });
        }
        resolve();
      });
    });
  }
}

module.exports = MongoDbClient;
