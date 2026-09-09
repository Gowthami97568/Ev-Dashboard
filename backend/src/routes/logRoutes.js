const express = require("express");

const router = express.Router();

const {
    getLogs
} = require("../controllers/logController");


// ======================================================
// GET LOGS
// ======================================================

router.get("/", getLogs);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;