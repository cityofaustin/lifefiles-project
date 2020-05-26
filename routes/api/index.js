const router = require("express").Router();
const { celebrate } = require("celebrate");

const AccountController = require("../../controllers/accountController");
const DocumentController = require("../../controllers/documentController");
const AdminController = require("../../controllers/adminController");

const auth = require("../middleware/auth");
const { isAllowedUploadDocument } = require("../middleware/permission");
const Schema = require("../middleware/schema");

// Admin
router
  .route("/my-admin-account")
  .get(auth.required, AdminController.myAdminAccount);

// Admin - Document Types
router
  .route("/admin-document-types")
  .post(auth.required, AdminController.addDocumentType);

router
  .route("/admin-document-types/:docTypeId")
  .delete(auth.required, AdminController.deleteDocumentType);

// Admin - Account Types
router
  .route("/admin-account-types")
  .get(auth.required, (req, res, next) =>
    AdminController.genericGet(req, res, next, "AccountType")
  )
  .post(auth.required, (req, res, next) =>
    AdminController.genericPost(req, res, next, "AccountType")
  );

// Admin - View Features
router
  .route("/admin-view-features")
  .get(auth.required, (req, res, next) =>
    AdminController.genericGet(req, res, next, "ViewFeature")
  )
  .post(auth.required, (req, res, next) =>
    AdminController.genericPost(req, res, next, "ViewFeature")
  );

// router
//   .route("/admin-document-types/:document-type-id/fields")
//   .post(auth.required, AdminController.addDocumentTypeField)
//   .delete(auth.required, AdminController.deleteDocumentTypeField);

// Admin - Create New Accounts
router.route("/admin-create-new-account").post(
  [
    auth.required,
    celebrate({
      body: Schema.userRegisterSchema,
    }),
  ],
  AdminController.newAccount
);

// Accounts
router.route("/my-account").get(auth.required, AccountController.myAccount);

router
  .route("/accounts")
  .get(auth.required, AccountController.getAccounts)
  .put(auth.required, AccountController.updateAccount);

router.route("/accounts/login").post(
  celebrate({
    body: Schema.userLoginSchema,
  }),
  AccountController.login
);

router
  .route("/account/:accountId/document-types/")
  .get(auth.required, AccountController.getAvailableDocumentTypes);

router
  .route("/account/:accountId/share-requests/")
  .get(auth.required, AccountController.getShareRequests);

router
  .route("/share-requests")
  .get(auth.required, AccountController.getShareRequests)
  .post([auth.required], AccountController.newShareRequest);

router
  .route("/share-requests/:shareRequestId")
  .put(auth.required, AccountController.approveOrDenyShareRequest)
  .delete(auth.required, AccountController.deleteShareRequest);

router
  .route("/profile-image/:imageurl/:jwt")
  .get(auth.image, AccountController.getProfileImage);

router
  .route("/get-encryption-key")
  .get(auth.required, AccountController.getEncryptionKey);

// Blockchain
router
  .route("/anchor-vp-to-blockchain/")
  .post(auth.required, DocumentController.anchorVpToBlockchain);

router
  .route("/generate-new-did/")
  .get(auth.required, DocumentController.generateNewDid);

// Documents
router.route("/document-types/").get(DocumentController.getDocumentTypes);
router.route("/txt-record/:recordId").get(DocumentController.getTxtRecord);

router
  .route("/documents/")
  .get(auth.required, DocumentController.getDocuments)
  .post(
    [
      auth.required,
      celebrate({
        body: Schema.uploadDocumentSchema,
      }),
      isAllowedUploadDocument,
    ],
    DocumentController.uploadDocument
  );

router
  .route("/documents/:documentId")
  .put(auth.required, DocumentController.updateDocument);

router
  .route("/account/:accountForId/documents/:documentType")
  .post(auth.required, DocumentController.updateDocumentVcJwt);

router
  .route("/upload-document-on-behalf-of-user/")
  .post(
    [auth.required, isAllowedUploadDocument],
    DocumentController.uploadDocumentOnBehalfOfUser
  );

router
  .route("/documents/:filename/:jwt")
  .get(auth.image, DocumentController.getDocument)
  .delete(DocumentController.deleteDocument);

// Admin - TODO: Add Admin Auth Only
router
  .route("/admin/role-permission-table")
  .get(AdminController.getRolePermissionTable)
  .post(AdminController.newRolePermissionTable);

router
  .route("/admin/generate-default-role-permissions-table")
  .get(AdminController.generateDefaultRolePermissionsTable);

// Admin - Roles
router
  .route("/roles")
  .get(auth.required, AdminController.getRoles)
  .post(
    [auth.required, celebrate({ body: Schema.roleSchema })],
    AdminController.newRole
  );

// Admin - Permissions
router
  .route("/permissions")
  .get(auth.required, AdminController.getPermissions)
  .post(
    [auth.required, celebrate({ body: Schema.permissionSchema })],
    AdminController.newPermission
  );

/* TODO:
      REMOVE THIS DANGEROUS CALL WHEN WE GO TO PRODUCTION
  */
// router.route("/reset-database/").post(AdminController.resetDatabase);
/* TODO:
      REMOVE THIS DANGEROUS CALL WHEN WE GO TO PRODUCTION
  */

router.use(function(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
