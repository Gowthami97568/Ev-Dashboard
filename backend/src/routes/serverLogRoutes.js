const express = require("express");

const {
    getServerLogs
} = require("../controllers/serverLogController");

const router = express.Router();

router.get("/", getServerLogs);

module.exports = router;