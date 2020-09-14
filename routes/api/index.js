const router = require("express").Router();
const { celebrate } = require("celebrate");

const AccountController = require("../../controllers/accountController");
const DocumentController = require("../../controllers/documentController");
const AdminController = require("../../controllers/adminController");
const AppController = require("../../controllers/AppSettingController");

const auth = require("../middleware/auth");
const {
  isAllowed,
  isAllowedPostShareRequest,
  onlyAdminAllowed,
  isAllowedReplaceDocument,
} = require("../middleware/permission");
const Schema = require("../middleware/schema");

// This route returns the url for the oauth sever (used in heroku setup)
router.route("/oauth-url").get(AdminController.oauthUrl);

// Admin
router
  .route("/my-admin-account")
  .get([auth.required, onlyAdminAllowed], AdminController.myAdminAccount);

// Admin - Document Types
router
  .route("/admin-document-types")
  .post([auth.required, onlyAdminAllowed], AdminController.addDocumentType);

router
  .route("/admin-document-types/:docTypeId")
  .delete([auth.required, onlyAdminAllowed], AdminController.deleteDocumentType)
  .put([auth.required, onlyAdminAllowed], AdminController.updateDocumentType);

// Admin - Account Types
router
  .route("/admin-account-types")
  .get([auth.required, onlyAdminAllowed], (req, res, next) =>
    AdminController.genericGet(req, res, next, "AccountType")
  )
  .post([auth.required, onlyAdminAllowed], (req, res, next) =>
    AdminController.genericPost(req, res, next, "AccountType")
  );

router
  .route("/admin-account-types/:accountTypeId")
  .delete([auth.required, onlyAdminAllowed], AdminController.deleteAccountType)
  .put([auth.required, onlyAdminAllowed], AdminController.updateAccountType);

// Admin - View Features
router
  .route("/admin-view-features")
  .get([auth.required, onlyAdminAllowed], (req, res, next) =>
    AdminController.genericGet(req, res, next, "ViewFeature")
  )
  .post([auth.required, onlyAdminAllowed], (req, res, next) =>
    AdminController.genericPost(req, res, next, "ViewFeature")
  );

// router
//   .route("/admin-document-types/:document-type-id/fields")
//   .post(auth.required, AdminController.addDocumentTypeField)
//   .delete(auth.required, AdminController.deleteDocumentTypeField);

// Admin - Accounts
router.route("/admin-accounts/").post(
  [
    [auth.required, onlyAdminAllowed],
    celebrate({
      body: Schema.userRegisterSchema,
    }),
  ],
  AdminController.newAccount
);

// Helper Registers Account
router.route("/helper-accounts/").post(
  [
    celebrate({
      body: Schema.helperRegisterSchema,
    }),
  ],
  AdminController.newHelperAccount
);

router
  .route("/admin-accounts/:accountId")
  .delete([auth.required, onlyAdminAllowed], AdminController.deleteAccount)
  .put([auth.required, onlyAdminAllowed], AdminController.updateAccount);

// Accounts
router.route("/my-account").get(auth.required, AccountController.myAccount);

router
  .route("/accounts")
  .get(auth.required, AccountController.getAccounts)
  .put(
    [
      auth.required,
      (req, res, next) => isAllowed(req, res, next, "updateAccountInfo"),
    ],
    AccountController.updateAccount
  );

// These are for helpers only, owners loing with oauth
router.route("/accounts/login").post(
  celebrate({
    body: Schema.userLoginSchema,
  }),
  AccountController.login
);

router.route("/accounts/secure-login").post(AccountController.secureLogin);

router.route("/accounts/admin-login").post(
  celebrate({
    body: Schema.userLoginSchema,
  }),
  AdminController.adminLogin
);

// This route is from oauth server to send code to user
router
  .route("/send-code/account/:username/:oneTimeCode/:loginUuid")
  .post(AccountController.sendOneTimeAccessCode);

// This route is from oauth server to send code to user's helpers
router
  .route("/send-helper-code/account/:username/:oneTimeCode/:loginUuid")
  .post(AccountController.sendOneTimeAccessCodeToHelpers);

router
  .route("/account/:accountId/document-types/")
  .get(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "shareViewFileExist", ["owner"]),
    ],
    AccountController.getAvailableDocumentTypes
  );

router
  .route("/account/:accountId/share-requests/")
  .get(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "shareViewOwners", ["owner"]),
    ],
    AccountController.getShareRequests
  );

router
  .route("/share-requests")
  .get(auth.required, AccountController.getShareRequests)
  .post(
    auth.required,
    (req, res, next) => isAllowedPostShareRequest(req, res, next),
    AccountController.newShareRequest
  );

router
  .route("/share-requests/:shareRequestId")
  .put(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "approveShareRequests", ["helper"]),
    ],
    AccountController.approveOrDenyShareRequest
  )
  .delete(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "revokeSharedDocuments", ["helper"]),
    ],
    AccountController.deleteShareRequest
  );

router
  .route("/profile-image/:imageurl/:jwt")
  .get(auth.image, AccountController.getProfileImage);

router.route("/image/:imageurl").get(AccountController.getImage);

router
  .route("/get-encryption-key")
  .get(auth.required, AccountController.getEncryptionKey);

// Blockchain
router
  .route("/anchor-vp-to-blockchain/")
  .post(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "acceptNotarizedDocument", ["helper"]),
    ],
    DocumentController.anchorVpToBlockchain
  );

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
      (req, res, next) => isAllowed(req, res, next, "uploadDocuments"),
    ],
    DocumentController.uploadDocument
  );

router
  .route("/documents/:documentId")
  .put(
    [
      auth.required,
      (req, res, next) => isAllowedReplaceDocument(req, res, next),
    ],
    DocumentController.updateDocument
  );

router
  .route("/account/:accountForId/documents/:documentType")
  .post(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "notarizeDocuments", ["owner"]),
    ],
    DocumentController.updateDocumentVcJwt
  );

router
  .route("/account/:accountForId/documents/:documentType/vp")
  .put(auth.required, DocumentController.updateDocumentVpJwt);

router
  .route("/upload-document-on-behalf-of-user/")
  .post(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "uploadDocBehalfOwner", ["owner"]),
    ],
    DocumentController.uploadDocumentOnBehalfOfUser
  );

router
  .route("/documents/:filename/:jwt")
  .get(auth.image, DocumentController.getDocument)
  .delete(
    [
      auth.required,
      (req, res, next) =>
        isAllowed(req, res, next, "deleteDocuments", ["helper"]),
    ],
    DocumentController.deleteDocument
  );

router.use(new AppController());

router.use(function (err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
