var mongoose = require("mongoose");

var AppSettingSchema = new mongoose.Schema({
  settingName: { type: String, index: true }, // e.g. title
  settingValue: { type: String }, // e.g. -- ----
});

const AppSetting = mongoose.model("AppSetting", AppSettingSchema);
module.exports = AppSetting;
