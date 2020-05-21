var mongoose = require("mongoose");

var ViewFeatureSchema = new mongoose.Schema({
  featureName: { type: String, index: true }, // e.g. zoomIn
  featureDisplay: { type: String } // e.g. Zoom-in
});

const ViewFeature = mongoose.model("ViewFeature", ViewFeatureSchema);
module.exports = ViewFeature;
