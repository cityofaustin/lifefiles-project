var mongoose = require("mongoose");

var ShareRequestSchema = new mongoose.Schema({
  shareWithAccountId: String,
  documentType: String,
  approved: Boolean,
  documentUrl: String,
  documentThumbnailUrl: String
});

const ShareRequest = mongoose.model("ShareRequest", ShareRequestSchema);
module.exports = ShareRequest;
