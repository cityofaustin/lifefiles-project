const router = require("express").Router();
const { celebrate } = require("celebrate");

const AccountController = require("../../controllers/accountController");
const DocumentController = require("../../controllers/documentController");
const AdminController = require("../../controllers/adminController");

const auth = require("../middleware/auth");
const { isAllowedUploadDocument } = require("../middleware/permission");
const Schema = require("../middleware/schema");

// Accounts
router.route("/my-account").get(auth.required, AccountController.getAcccount);

router
  .route("/accounts")
  .get(auth.required, AccountController.getAcccounts)
  .post(
    celebrate({
      body: Schema.userRegisterSchema
    }),
    AccountController.newAccount
  );

router.route("/accounts/login").post(
  celebrate({
    body: Schema.userLoginSchema
  }),
  AccountController.login
);
router
  .route("/account/:accountId/document-types/")
  .get(auth.required, AccountController.getAvailableDocumentTypes);

router
  .route("/account/:accountId/share-requests/")
  .get(auth.required, AccountController.getShareRequests)
  .post(
    [auth.required, celebrate({ body: Schema.shareRequestSchema })],
    AccountController.newShareRequest
  )
  .put(auth.required, AccountController.approveOrDenyShareRequest);

// Documents
router.route("/document-types/").get(DocumentController.getDocumentTypes);

router
  .route("/documents/")
  .get(auth.required, DocumentController.getDocuments)
  .post(
    [auth.required, isAllowedUploadDocument],
    DocumentController.uploadDocument
  );

router
  .route("/upload-document-and-notarize-on-behalf-of-user/")
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

router.use(function(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
