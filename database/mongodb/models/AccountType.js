var mongoose = require("mongoose");

var AccountTypeSchema = new mongoose.Schema({
  accountTypeName: {
    type: String,
    index: true,
    required: [true, "can't be blank"],
  },
  adminLevel: { type: Number, required: [true, "can't be blank"] },
  viewFeatures: [{ type: mongoose.Schema.Types.ObjectId, ref: "ViewFeature" }],
});

const AccountType = mongoose.model("AccountType", AccountTypeSchema);
module.exports = AccountType;
