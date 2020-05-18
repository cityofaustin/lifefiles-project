var mongoose = require("mongoose");

var ViewFeatureSchema = new mongoose.Schema({
  featureName: { type: String, index: true },
});

const ViewFeature = mongoose.model("ViewFeature", ViewFeatureSchema);
module.exports = ViewFeature;
