const { Joi } = require("celebrate");

module.exports = {
  userLoginSchema: Joi.object().keys({
    account: Joi.object()
      .keys({
        email: Joi.string().min(1).required(),
        password: Joi.string().min(1).required(),
      })
      .required(),
  }),

  userRegisterSchema: Joi.object().keys({
    account: Joi.object()
      .keys({
        email: Joi.string().min(1).required(),
        password: Joi.string().min(1).required(),
        accounttype: Joi.string().min(1).optional(),
        username: Joi.string().min(1).required(),
        firstname: Joi.string().min(1).optional(),
        lastname: Joi.string().min(1).optional(),
        phonenumber: Joi.string().min(1).optional(),
        organization: Joi.string().min(1).optional(),
        canAddOtherAccounts: Joi.any().optional(),
        publicEncryptionKey: Joi.any().optional(),
      })
      .required(),
  }),

  helperRegisterSchema: Joi.object().keys({
    // note: didn't recognize as object with multipart upload
    email: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
    accounttype: Joi.string().min(1).optional(),
    username: Joi.string().min(1).required(),
    firstname: Joi.string().min(1).optional(),
    lastname: Joi.string().min(1).optional(),
    phonenumber: Joi.string().min(1).optional(),
    organization: Joi.string().min(1).optional(),
    canAddOtherAccounts: Joi.any().optional(),
    publicEncryptionKey: Joi.any().optional(),
    notaryId: Joi.string().optional(),
    notaryState: Joi.string().optional(),
    role: Joi.string().required()
  }),

  permissionSchema: Joi.object().keys({
    permission: Joi.object()
      .keys({
        name: Joi.string().min(1).required(),
        paired: Joi.bool().required(),
      })
      .required(),
  }),

  shareRequestSchema: Joi.object().keys({
    shareRequest: Joi.object()
      .keys({
        documentType: Joi.string().min(1).required(),
        toAccountId: Joi.string().min(1).required(),
        fromAccountId: Joi.string().min(1).required(),
      })
      .required(),
  }),

  roleSchema: Joi.object().keys({
    role: Joi.object()
      .keys({
        name: Joi.string().min(1).required(),
      })
      .required(),
  }),

  uploadDocumentSchema: Joi.object().keys({
    type: Joi.string().min(1).required(),
    validuntildate: Joi.string().min(1).optional(),
    encryptionPubKey: Joi.string().min(1).required(),
  }),

  createNotarizedDocumentSchema: Joi.object().keys({
    ownerAccountId: Joi.string().min(1).required(),
    notaryId: Joi.string().min(1).required(),
    type: Joi.string().min(1).required(),
    expirationDate: Joi.string().min(1).required(),
  }),
};
