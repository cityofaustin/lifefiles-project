let common = require("../../common/common");

module.exports = {
  isAllowedUploadDocument: (req, res, next) => {
    let permTable = common.dbClient.getCachedRolePermissionsTable();
    let key = req.payload.role + "-uploadDocument";
    if (permTable !== undefined && permTable[key] === false) {
      console.log("Not authorized. This role does not have permissions for this action.");
      res.status(403).json({
        error: "Not authorized. This role does not have permissions for this action."
      });
    } else {
      next();
    }
  }
};
