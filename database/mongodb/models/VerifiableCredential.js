var mongoose = require("mongoose");

var VerifiableCredentialSchema = new mongoose.Schema({
  vcJwt: String,
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  document: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  documentDid: String,
  documentDidPrivateKey: String,
  verifiedVC: String
});

const VerifiableCredential = mongoose.model(
  "VerifiableCredential",
  VerifiableCredentialSchema
);
module.exports = VerifiableCredential;
