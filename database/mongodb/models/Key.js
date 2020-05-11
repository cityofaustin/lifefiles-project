var mongoose = require("mongoose");

var KeySchema = new mongoose.Schema({
  uuid: { type: String, index: true },
  encryptedKey: String,
});

const Key = mongoose.model("Key", KeySchema);
module.exports = Key;
