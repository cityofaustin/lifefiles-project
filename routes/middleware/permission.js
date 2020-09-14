let common = require("../../common/common");

module.exports = {
  // TODO: cache this for faster load times
  isAllowed: async (req, res, next, featureName, restrictedRoles = []) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const accountType = await common.dbClient.getAccountTypesById(
      account.accountType
    );

    let authorized = false;
    if (featureName === "-") {
      authorized = true;
    } else {
      authorized = accountType.coreFeatures.some(
        (coreFeature) => coreFeature.featureName === featureName
      );
    }

    if (!authorized || restrictedRoles.includes(account.role)) {
      res.status(403).json({
        error:
          "Not authorized. This role does not have permissions for this action.",
      });
    } else {
      next();
    }
  },

  onlyOwnerAllowed: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    if (account.role !== "owner") {
      res.status(403).json({
        error:
          "Not authorized. This role does not have perms for this action. Only owners are allowed for this route.",
      });
    } else {
      next();
    }
  },

  onlyAdminAllowed: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);

    if (account.role !== "admin" && account.canAddOtherAccounts !== true) {
      res.status(403).json({
        error:
          "Not authorized. This role does not have perms for this action. Only admins are allowed for this route.",
      });
    } else {
      next();
    }
  },

  isAllowedPostShareRequest: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const accountType = await common.dbClient.getAccountTypesById(
      account.accountType
    );

    let authorized = false;
    if (account.role === "helper") {
      authorized = accountType.coreFeatures.some(
        (coreFeature) => coreFeature.featureName === "requestSharedDoc"
      );
    } else if (account.role === "owner") {
      authorized = accountType.coreFeatures.some(
        (coreFeature) => coreFeature.featureName === "pushSharedDocuments"
      );
    }

    if (!authorized) {
      res.status(403).json({
        error:
          "Not authorized. This role does not have permissions for this action.",
      });
    } else {
      next();
    }
  },

  isAllowedReplaceDocument: async (req, res, next) => {
    const account = await common.dbClient.getAccountById(req.payload.id);
    const accountType = await common.dbClient.getAccountTypesById(
      account.accountType
    );

    let authorized = false;
    if (account.role === "helper") {
      authorized = accountType.coreFeatures.some(
        (coreFeature) => coreFeature.featureName === "replaceDocBehalfOwner"
      );
    } else if (account.role === "owner") {
      authorized = accountType.coreFeatures.some(
        (coreFeature) => coreFeature.featureName === "replaceDocuments"
      );
    }

    if (!authorized) {
      res.status(403).json({
        error:
          "Not authorized. This role does not have permissions for this action.",
      });
    } else {
      next();
    }
  },
};
