const mongoose = require("mongoose");

const helperContactSchema = new mongoose.Schema({
  ownerAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  helperAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  isSocialAttestationEnabled: Boolean,
  canAddNewDocuments: Boolean,
});
helperContactSchema.index({'ownerAccount': 1, 'helperAccount': 1}, {unique: true});

const HelperContact = mongoose.model(
  "HelperContact",
  helperContactSchema
);

module.exports = HelperContact;
