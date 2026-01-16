const express = require("express");
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require("../src/controllers/settingsController");

router.get("/", getSystemSettings);
router.post("/", updateSystemSettings);

module.exports = router;
