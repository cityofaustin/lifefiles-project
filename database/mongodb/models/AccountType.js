var mongoose = require("mongoose");

var AccountTypeSchema = new mongoose.Schema({
  accountTypeName: {
    type: String,
    index: true,
    required: [true, "can't be blank"],
  },
  role: {type: String, enum: ["owner", "helper", "admin"], required: true},
  adminLevel: { type: Number, required: [true, "can't be blank"] },
  viewFeatures: [{ type: mongoose.Schema.Types.ObjectId, ref: "ViewFeature" }],
  coreFeatures: [{ type: mongoose.Schema.Types.ObjectId, ref: "CoreFeature" }],
});

const AccountType = mongoose.model("AccountType", AccountTypeSchema);
module.exports = AccountType;
