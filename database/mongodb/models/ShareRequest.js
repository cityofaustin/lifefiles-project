var mongoose = require("mongoose");

var ShareRequestSchema = new mongoose.Schema({
  shareWithAccountId: String,
  documentType: String,
  approved: Boolean,
  canView: Boolean,
  canReplace: Boolean,
  canDownload: Boolean,
  documentUrl: { type: String, index: true },
  documentThumbnailUrl: { type: String, index: true },
});

const ShareRequest = mongoose.model("ShareRequest", ShareRequestSchema);
module.exports = ShareRequest;
