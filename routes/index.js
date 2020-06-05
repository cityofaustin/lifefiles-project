var router = require("express").Router();
const oauthServer = require("../oath");

router.use("/api", oauthServer.authenticate(), require("./api"));

module.exports = router;
