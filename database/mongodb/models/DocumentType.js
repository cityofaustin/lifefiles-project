var mongoose = require("mongoose");

var DocumentTypeSchema = new mongoose.Schema({
  name: String,
  fields: [{ fieldName: String, required: Boolean }]
});

const DocumentType = mongoose.model("DocumentType", DocumentTypeSchema);
module.exports = DocumentType;
