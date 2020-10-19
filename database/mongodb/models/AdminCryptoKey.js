var mongoose = require("mongoose");

var AdminCryptoKeySchema = new mongoose.Schema({
  publicKey: String,
  privateKey: String,
});

const AdminCryptoKey = mongoose.model("AdminCryptoKey", AdminCryptoKeySchema);
module.exports = AdminCryptoKey;
