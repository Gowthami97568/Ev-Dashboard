const express = require("express");

const router = express.Router();

const {
    getLogDeviceIds,
    getLogs
} = require("../controllers/logController");

router.get("/devices", getLogDeviceIds);

// ======================================================
// GET LOGS
// ======================================================

router.get("/", getLogs);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;