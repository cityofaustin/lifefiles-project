const express = require("express");
const common = require("../common/common");
const auth = require("../routes/middleware/auth");
const { onlyAdminAllowed } = require("../routes/middleware/permission");
const documentStorageHelper = require("../common/documentStorageHelper");

const path = "/admin/app-settings";
const router = express.Router();

class AppSettingController {

  constructor() {
    this.initializeRoutes();
    return router;
  }

  initializeRoutes() {
    router
      .route(path)
      .post([auth.required, onlyAdminAllowed], this.saveAppSetting);
    router.route(path).get(this.getAppSettings);
  }

  saveAppSetting = async (req, res) => {
    const appSettings = [];
    let logoImgUrl;
    if (req.files && req.files.img) {
      logoImgUrl = await documentStorageHelper.upload(
        req.files.img,
        "profile-image"
      );
    }
    const titleSetting = await common.dbClient.saveAppSetting({
      settingName: "title",
      settingValue: req.body.title,
    });
    if (logoImgUrl) {
      const logoSetting = await common.dbClient.saveAppSetting({
        settingName: "logo",
        settingValue: logoImgUrl,
      });
      appSettings.push(logoSetting);
    }
    appSettings.push(titleSetting);
    res.status(200).json(appSettings);
  };

  getAppSettings = async (req, res) => {
    const appSettings = await common.dbClient.getAppSettings();
    res.status(200).json(appSettings);
  };
}

module.exports = AppSettingController;
