var mongoose = require("mongoose");

var DocumentSchema = new mongoose.Schema(
  {
    name: String,
    url: { type: String, index: true },
    thumbnailUrl: { type: String, index: true },
    notarized: Boolean,
    did: String,
    hash: String,
    vcJwt: String,
    vpJwt: String,
    type: String,
    encryptionPubKey: String,
    permanentOrgFileArchiveNumber: String,
    validUntilDate: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    belongsTo: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    sharedWithAccountIds: [String],
  },
  { timestamps: true }
);

DocumentSchema.methods.getPublicInfo = function (account) {
  if (account.email === undefined) {
    return account;
  } else {
    return account.toPublicInfo();
  }
};

DocumentSchema.methods.toPublicInfo = function () {
  return {
    id: this._id,
    name: this.name,
    url: this.url,
    thumbnailUrl: this.thumbnailUrl,
    did: this.did,
    hash: this.hash,
    vcJwt: this.vcJwt,
    vpJwt: this.vpJwt,
    type: this.type,
    encryptionPubKey: this.encryptionPubKey,
    permanentOrgFileArchiveNumber: this.permanentOrgFileArchiveNumber,
    validUntilDate: this.validUntilDate,
    sharedWithAccountIds: this.sharedWithAccountIds,
    uploadedBy: this.getPublicInfo(this.uploadedBy),
    belongsTo: this.getPublicInfo(this.belongsTo),
  };
};

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;
