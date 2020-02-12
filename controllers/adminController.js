const common = require("../common/common");

module.exports = {
  getPermissions: async (req, res, next) => {
    const permissions = await common.dbClient.getAllPermissions();
    res.status(200).json({ permissions });
  },

  newPermission: async (req, res, next) => {
    const permission = await common.dbClient.createPermission(req.body.permission);
    return res.status(201).json({ permission: permission });
  },

  getRoles: async (req, res, next) => {
    const roles = await common.dbClient.getAllRoles();
    res.status(200).json({ roles });
  },

  newRole: async (req, res, next) => {
    const role = await common.dbClient.createRole(req.body.role);
    return res.status(201).json({ role: role });
  },

  newRolePermissionTable: async (req, res, next) => {
    const rolePermissionTable = await common.dbClient.newRolePermissionTable(req.body.rolePermissionTable);
    return res.status(201).json({ rolePermissionTable: rolePermissionTable });
  },

  getRolePermissionTable: async (req, res, next) => {
    const rolePermissionTable = await common.dbClient.getLatestRoleLPermissionTable();
    return res.status(200).json({ rolePermissionTable: rolePermissionTable });
  },

  generateDefaultRolePermissionsTable: async (req, res, next) => {
    const roles = await common.dbClient.getAllRoles();
    const permissions = await common.dbClient.getAllPermissions();

    let rolePermissionTable = {};

    for (role of roles) {
      for (permission of permissions) {
        if (permission.paired === false) {
          rolePermissionTable[role.name + "-" + permission.name] = true;
        }
      }
    }

    for (role of roles) {
      for (innerRole of roles) {
        for (permission of permissions) {
          if (permission.paired === true) {
            if (role.name !== innerRole.name) {
              rolePermissionTable[role.name + "-" + permission.name + "-" + innerRole.name] = true;
            }
          }
        }
      }
    }
    return res.status(201).json({ rolePermissionTable: rolePermissionTable });
  }
};
