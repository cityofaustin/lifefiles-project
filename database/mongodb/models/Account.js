var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");

var AccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      // username currently is required, unique, and a key,
      // by allowing emails to be usernames if they chose to use email
      // instead of username we can fix that this way
      // otherwise username should not be required
      // match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    oauthId: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    organization: String,
    profileImageUrl: String,
    role: String,
    permanentOrgArchiveNumber: String,
    didAddress: String,
    didPublicEncryptionKey: String,
    didPrivateKeyGuid: String,
    canAddOtherAccounts: Boolean,
    signMessage: String,
    hash: String,
    salt: String,
    accountType: { type: mongoose.Schema.Types.ObjectId, ref: "AccountType" },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    shareRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ShareRequest" },
    ],
    notaryId: String,
    notaryState: String,
    isNotDisplayPhoto: Boolean,
    isNotDisplayName: Boolean,
    isNotDisplayPhone: Boolean
  },
  { timestamps: true },
  { usePushEach: true }
);

AccountSchema.plugin(uniqueValidator, { message: "is already taken." });

AccountSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

AccountSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

AccountSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      role: this.role,
      exp: parseInt(exp.getTime() / 1000, 10),
    },
    process.env.AUTH_SECRET
  );
};

AccountSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    id: this._id,
    email: this.email,
    role: this.role,
    didAddress: this.didAddress,
    didPublicEncryptionKey: this.didPublicEncryptionKey,
    token: this.generateJWT(),
    shareRequests: this.shareRequests,
    documents: this.documents,
    profileImageUrl: this.profileImageUrl,
    canAddOtherAccounts: this.canAddOtherAccounts,
    notaryId: this.notaryId,
    notaryState: this.notaryState,
    phoneNumber: this.phoneNumber,
    isNotDisplayPhoto: this.isNotDisplayPhoto,
    isNotDisplayName: this.isNotDisplayName,
    isNotDisplayPhone: this.isNotDisplayPhone
  };
};

AccountSchema.methods.toPublicInfo = function () {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    organization: this.organization,
    phoneNumber: this.phoneNumber,
    id: this._id,
    email: this.email,
    role: this.role,
    didAddress: this.didAddress,
    didPublicEncryptionKey: this.didPublicEncryptionKey,
    profileImageUrl: this.profileImageUrl,
    accountType: this.accountType,
    canAddOtherAccounts: this.canAddOtherAccounts,
    notaryId: this.notaryId,
    notaryState: this.notaryState,
  };
};

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
