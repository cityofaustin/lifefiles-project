var mongoose = require("mongoose");

var PermissionSchema = new mongoose.Schema({
  name: String,
  paired: Boolean,
});

const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;
