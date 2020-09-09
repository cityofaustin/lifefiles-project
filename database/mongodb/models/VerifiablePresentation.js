var mongoose = require("mongoose");

var VerifiablePresentationSchema = new mongoose.Schema({
  vpJwt: String,
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  document: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  documentDid: String,
  verifiedVP: String,
});

const VerifiablePresentation = mongoose.model(
  "VerifiablePresentation",
  VerifiablePresentationSchema
);
module.exports = VerifiablePresentation;
