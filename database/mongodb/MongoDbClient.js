const mongoose = require("mongoose");
const secureKeyStorage = require("../../common/secureKeyStorage");

const DBUtil = require("./DBUtil");

const Account = require("./models/Account");
const Document = require("./models/Document");
const AccountType = require("./models/AccountType");
const ViewFeature = require("./models/ViewFeature");
const CoreFeature = require("./models/CoreFeature");
const DocumentType = require("./models/DocumentType");
const Key = require("./models/Key");
const Role = require("./models/Role");
const Permission = require("./models/Permission");
const ShareRequest = require("./models/ShareRequest");
const RolePermissionTable = require("./models/RolePermissionTable");
const VerifiableCredential = require("./models/VerifiableCredential");
const VerifiablePresentation = require("./models/VerifiablePresentation");

const classes = new Map();
classes.set("AccountType", AccountType);
classes.set("ViewFeature", ViewFeature);
classes.set("CoreFeature", CoreFeature);

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
    DBUtil.populateDefaultValues(this, secureKeyStorage);
  }

  // Cache
  async updateRolePermissionsTableCache() {
    this.cachedRolePermissionTable = await this.getLatestRolePermissionTable();
  }

  getCachedRolePermissionsTable() {
    return this.cachedRolePermissionTable;
  }
  // Encrytpion Keys
  async store(guid, key) {
    const keyEntity = new Key();
    keyEntity.uuid = guid;
    keyEntity.encryptedKey = key;
    await keyEntity.save();
    return keyEntity;
  }
  async retrieve(guid) {
    let key = await Key.findOne({
      uuid: guid,
    });

    return key;
  }

  // Helpers
  async genericGet(type) {
    const theClass = classes.get(type);
    const allObjects = await theClass.find({});
    return allObjects;
  }

  async genericPost(postBody, type) {
    const theClass = classes.get(type);
    const newClassInstance = new theClass();

    for (var key of Object.keys(postBody)) {
      newClassInstance[key] = postBody[key];
    }

    await newClassInstance.save();
    return newClassInstance;
  }

  // Admin
  async getAdminData() {
    let adminData = {};
    adminData.documentTypes = await DocumentType.find({});
    adminData.accountTypes = await AccountType
    .find({})
    .populate({path: "viewFeatures"})
    .populate({path: "coreFeatures"});

    adminData.viewFeatures = await ViewFeature.find({});
    adminData.coreFeatures = await CoreFeature.find({});
    return adminData;
  }

  // Accounts
  async getAccountById(id) {
    const account = await Account.findById(id);
    return account;
  }

  async getAccountAdminLevelById(id) {
    const account = await Account.findById(id);
    const accountType = await AccountType.findById(account.accountType);
    return accountType.adminLevel;
  }

  async getAllAccountInfoById(id) {
    const account = await Account.findById(id).populate([
      "documents",
      "shareRequests",
      "accountType",
    ]);
    return account;
  }

  async getAllAccounts() {
    const accounts = await Account.find({});
    return accounts;
  }

  // Core Features
  async addCoreFeature(feature) {
    const coreFeature = new CoreFeature();
    coreFeature.featureName = feature.featureName;
    coreFeature.featureDisplay = feature.featureDisplay;
    coreFeature.featureRole = feature.featureRole;
    await coreFeature.save();
    return coreFeature;
  }

  // View Featuers and Account Types
  async addViewFeature(feature) {
    const viewFeature = new ViewFeature();
    viewFeature.featureName = feature.featureName;
    viewFeature.featureDisplay = feature.featureDisplay;
    await viewFeature.save();
    return viewFeature;
  }

  async getAllAccountTypes() {
    const accountType = await AccountType.find({});
    return accountType;
  }

  async getAccountTypeByRole(accountTypeName) {
    const accountType = await AccountType.findOne({
      accountTypeName: accountTypeName,
    });
    return accountType;
  }

  async createAccountType(accountTypeInput, adminLevel) {
    const accountType = new AccountType();
    accountType.accountTypeName = accountTypeInput.accountTypeName;
    accountType.role = accountTypeInput.role;
    accountType.adminLevel = adminLevel;
    await accountType.save();
    return accountType;
  }

  async addCoreFeatureToAccountType(accountTypeName, featureName) {
    const coreFeature = await CoreFeature.findOne({ featureName: featureName });
    const accountType = await AccountType.findOne({ accountTypeName: accountTypeName });
    accountType.coreFeatures.push(coreFeature);
    await accountType.save();
    return accountType;
  }

  async addViewFeatureToAccountType(accountTypeName, featureName) {
    const viewFeature = await ViewFeature.findOne({ featureName: featureName });
    const accountType = await AccountType.findOne({
      accountTypeName: accountTypeName,
    });
    accountType.viewFeatures.push(viewFeature);
    await accountType.save();
    return accountType;
  }

  async getCoreFeatureStringByManyIds(ids) {
    let coreFeatures = await CoreFeature.find()
      .where("_id")
      .in(ids)
      .exec();

    let coreFeaturesStringArr = [];
    for (let coreFeature of coreFeatures) {
      coreFeaturesStringArr.push(coreFeature.featureName);
    }

    return coreFeaturesStringArr;
  }

  async getViewFeatureStringByManyIds(ids) {
    let viewFeatures = await ViewFeature.find()
      .where("_id")
      .in(ids)
      .exec();

    let viewFeaturesStringArr = [];
    for (let viewFeature of viewFeatures) {
      viewFeaturesStringArr.push(viewFeature.featureName);
    }

    return viewFeaturesStringArr;
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

    accountReq.role = (accountReq.role === 'notary') ? 'helper' : accountReq.role;
    const accountType = await AccountType.findOne({
      role: accountReq.role,
    });

    newAccount.accountType = accountType;

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
  // NOTE: share request doesn't have document id but it has document type
  async deleteShareRequestByDocumentId(documentType) {
    await ShareRequest.deleteMany({
      documentType: documentType,
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
    newDocumentType.isTwoSided = documentType.isTwoSided;
    newDocumentType.hasExpirationDate = documentType.hasExpirationDate;
    newDocumentType.isProtectedDoc = documentType.isProtectedDoc;
    newDocumentType.isRecordableDoc = documentType.isRecordableDoc;

    if (documentType.fields !== undefined) {
      for (let field of documentType.fields) {
        newDocumentType.fields.push(field);
      }
    }
    const documentTypeSaved = await newDocumentType.save();
    return documentTypeSaved;
  }
  
  async updateDocumentType(id, documentType) {
    const docType = await DocumentType.findById(id);
    docType.name = documentType.name;
    docType.isTwoSided = documentType.isTwoSided;
    docType.hasExpirationDate = documentType.hasExpirationDate;
    docType.isProtectedDoc = documentType.isProtectedDoc;
    docType.isRecordableDoc = documentType.isRecordableDoc;

    const documentTypeSaved = await docType.save();
    return documentTypeSaved;
  }

  async deleteDocumentType(docTypeId) {
    const docuemntType = await DocumentType.findOneAndRemove({
      _id: docTypeId,
    });

    return docuemntType;
  }

  async updateAccountType(id, accountType) {
    const accType = await AccountType.findById(id);
    accType.accountTypeName = accountType.accountTypeName;
    accType.role = accountType.role;
    accType.adminLevel = accountType.adminLevel;
    accType.viewFeatures = accountType.viewFeatures;
    accType.coreFeatures = accountType.coreFeatures;

    const accountTypeSaved = await accType.save();
    return accountTypeSaved;
  }

  async deleteAccountType(accountTypeId) {
    const accountType = await AccountType.findOneAndRemove({
      _id: accountTypeId,
    });

    return accountType;
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
    encryptionPubKey,
    claimed = true
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
    newDocument.claimed = claimed;
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
    validUntilDate,
    claimed
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
    document.claimed = claimed;
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
