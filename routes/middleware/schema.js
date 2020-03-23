const { Joi } = require("celebrate");

module.exports = {
  userLoginSchema: Joi.object().keys({
    account: Joi.object()
      .keys({
        email: Joi.string()
          .min(1)
          .required(),
        password: Joi.string()
          .min(1)
          .required()
      })
      .required()
  }),

  userRegisterSchema: Joi.object().keys({
    account: Joi.object()
      .keys({
        email: Joi.string()
          .min(1)
          .required(),
        password: Joi.string()
          .min(1)
          .required(),
        role: Joi.string()
          .min(1)
          .required(),
        username: Joi.string()
          .min(1)
          .required(),
        firstname: Joi.string()
          .min(1)
          .optional(),
        lastname: Joi.string()
          .min(1)
          .optional()
      })
      .required()
  }),

  permissionSchema: Joi.object().keys({
    permission: Joi.object()
      .keys({
        name: Joi.string()
          .min(1)
          .required(),
        paired: Joi.bool().required()
      })
      .required()
  }),

  shareRequestSchema: Joi.object().keys({
    shareRequest: Joi.object()
      .keys({
        accountId: Joi.string()
          .min(1)
          .required(),
        documentType: Joi.string()
          .min(1)
          .required()
      })
      .required()
  }),

  roleSchema: Joi.object().keys({
    role: Joi.object()
      .keys({
        name: Joi.string()
          .min(1)
          .required()
      })
      .required()
  })
};
