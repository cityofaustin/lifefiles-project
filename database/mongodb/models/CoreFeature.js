var mongoose = require("mongoose");

var CoreFeatureSchema = new mongoose.Schema({
  featureName: { type: String, index: true }, // e.g. uploadDocOwner
  featureDisplay: { type: String }, // e.g. Can upload docs on behalf of owner
  featureRole: {
    type: String,
    enum: ["owner", "helper", "admin"],
    required: true,
  }, // e.g. helper
});

const CoreFeature = mongoose.model("CoreFeature", CoreFeatureSchema);
module.exports = CoreFeature;
