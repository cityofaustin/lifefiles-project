var mongoose = require("mongoose");

var RolePermissionTableSchema = new mongoose.Schema({
  rolePermissionTable: String
});

const RolePermissionTable = mongoose.model(
  "RolePermissionsTable",
  RolePermissionTableSchema
);
module.exports = RolePermissionTable;
