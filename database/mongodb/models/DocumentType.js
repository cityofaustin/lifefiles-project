var mongoose = require("mongoose");

var DocumentTypeSchema = new mongoose.Schema({
  name: { type: String, index: true },
  fields: [{ fieldName: String, required: Boolean }],
  isTwoSided: Boolean,
  hasExpirationDate: Boolean,
  isProtectedDoc: Boolean,
  isRecordableDoc: Boolean,
});

const DocumentType = mongoose.model("DocumentType", DocumentTypeSchema);
module.exports = DocumentType;
