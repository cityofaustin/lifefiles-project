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
    this.router
      .route(this.path + "/:id/share-requests")
      .delete([auth.required, onlyOwnerAllowed], this.unshareAllWithHelper);
  }

  addHelperContact = async (req, res, next) => {
    try {
      const helperAccount = await common.dbClient.getAccountById(
        req.body.helperAccountId
      );
      if (helperAccount) {
        const helperContact = await common.dbClient.addHelperContact({
          ownerAccount: req.payload.id,
          helperAccount: req.body.helperAccountId,
          isSocialAttestationEnabled: req.body.isSocialAttestationEnabled,
          canAddNewDocuments: req.body.canAddNewDocuments,
        });
        helperContact.ownerAccount = helperContact.ownerAccount.toPublicInfo();
        helperContact.helperAccount = helperContact.helperAccount.toPublicInfo();
        res.status(200).json(helperContact);
      } else {
        res.status(500).json({ error: "helper account is not there" });
      }
    } catch (err) {
      next(err); // Pass errors to Express.
    }
  };

  unshareAllWithHelper = async (req, res, next) => {
    try {
      const { id } = { ...req.params };
      // get owner share requests for the helper and delete them
      const hc = await common.dbClient.getHelperContactById(id);
      const ownerAccount = await common.dbClient.getAccountByUsernameWithShareRequests(
        hc.ownerAccount.username
      );
      const helperAccount = await common.dbClient.getAccountByUsername(
        hc.helperAccount.username
      );
      const ownerShareRequests = ownerAccount.shareRequests;
      const shareRequests = ownerShareRequests.filter(
        (osr) => osr.shareWithAccountId === helperAccount.id
      );
      const deleteIds = shareRequests.map((sr) => sr.id);
      await common.dbClient.deleteShareRequestByIds(deleteIds);
      res.status(200).json({ message: "success" });
    } catch (err) {
      next(err);
    }
  };

  deleteHelperContact = async (req, res, next) => {
    try {
      const { id } = { ...req.params };
      // get owner share requests for the helper and delete them first
      const hc = await common.dbClient.getHelperContactById(id);
      const ownerAccount = await common.dbClient.getAccountByUsernameWithShareRequests(
        hc.ownerAccount.username
      );
      const helperAccount = await common.dbClient.getAccountByUsername(
        hc.helperAccount.username
      );
      const ownerShareRequests = ownerAccount.shareRequests;
      const shareRequests = ownerShareRequests.filter(
        (osr) => osr.shareWithAccountId === helperAccount.id
      );
      const deleteIds = shareRequests.map((sr) => sr.id);
      await common.dbClient.deleteShareRequestByIds(deleteIds);
      // then delete the owner helper contact
      await common.dbClient.deleteHelperContact(id);
      res.status(200).json({ message: "success" });
    } catch (err) {
      next(err);
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
}

module.exports = HelperContactController;
