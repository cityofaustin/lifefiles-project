const express = require("express");
const common = require("../common/common");
const Account = require("../database/mongodb/models/Account");
const auth = require("../routes/middleware/auth");
const { onlyOwnerAllowed } = require("../routes/middleware/permission");

class HelperContactController {
  path = "/helper-contacts";
  router = express.Router();

  constructor() {
    this.initializeRoutes();
    return this.router;
  }

  initializeRoutes() {
    this.router
      .route(this.path)
      .post([auth.required, onlyOwnerAllowed], this.addHelperContact);
    this.router.route(this.path).get(auth.required, this.getHelperContacts);
    this.router
      .route(this.path + "/:id")
      .delete([auth.required, onlyOwnerAllowed], this.deleteHelperContact);
  }

  addHelperContact = async (req, res, next) => {
    try {
      const helperContact = await common.dbClient.addHelperContact({
        ownerAccount: req.payload.id,
        helperAccount: req.body.helperAccountId,
        isSocialAttestationEnabled: req.body.isSocialAttestationEnabled,
        canAddNewDocuments: req.body.canAddNewDocuments,
      });
      helperContact.ownerAccount = helperContact.ownerAccount.toPublicInfo();
      helperContact.helperAccount = helperContact.helperAccount.toPublicInfo();
      res.status(200).json(helperContact);
    } catch (err) {
      next(err); // Pass errors to Express.
    }
  };

  getHelperContacts = async (req, res) => {
    let helperContacts = [];
    const accountId = req.payload.id;
    const account = await common.dbClient.getAccountById(req.payload.id);
    if (account.role === "owner") {
      helperContacts = await common.dbClient.getHelperContactsForOwner(
        accountId
      );
    } else if (account.role === "helper") {
      helperContacts = await common.dbClient.getHelperContactsForHelper(
        accountId
      );
    }
    helperContacts = helperContacts.map((item) => {
      item.ownerAccount = item.ownerAccount.toPublicInfo();
      item.helperAccount = item.helperAccount.toPublicInfo();
      return item;
    });
    res.status(200).json(helperContacts);
  };

  deleteHelperContact = async (req, res) => {
    // TODO:
    const { id } = { ...req.params };
    res.status(200).json({ message: "success" });
  };
}

module.exports = HelperContactController;
