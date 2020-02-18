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
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    role: String,
    didAddress: String,
    didPrivateKey: String,
    hash: String,
    salt: String,
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    shareRequests: [
      {
        shareWithAccount: { type: mongoose.Schema.Types.ObjectId, ref: "AccountId" },
        shareDocumentType: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentType" }
      }
    ]
  },
  { timestamps: true },
  { usePushEach: true }
);

AccountSchema.plugin(uniqueValidator, { message: "is already taken." });

AccountSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

AccountSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

AccountSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      role: this.role,
      exp: parseInt(exp.getTime() / 1000)
    },
    process.env.AUTH_SECRET
  );
};

AccountSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    role: this.role,
    didAddress: this.didAddress,
    token: this.generateJWT()
  };
};

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
