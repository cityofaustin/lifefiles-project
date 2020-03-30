var mongoose = require("mongoose");

var DocumentSchema = new mongoose.Schema(
  {
    name: String,
    url: { type: String, index: true },
    notarized: Boolean,
    did: String,
    hash: String,
    vcJwt: String,
    vpJwt: String,
    type: String,
    permanentOrgFileArchiveNumber: String,
    validUntilDate: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    belongsTo: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    sharedWithAccountIds: [String]
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;
