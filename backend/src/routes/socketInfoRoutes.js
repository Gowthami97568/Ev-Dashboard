const express = require("express");

const {
    getSocketInfoSummary,
    getSocketInfoColumns,
    getSocketInfo,
    getSocketInfoById
} = require("../controllers/socketInfoController");

const router = express.Router();

// Summary
router.get(
    "/summary",
    getSocketInfoSummary
);

// Actual database columns
router.get(
    "/columns",
    getSocketInfoColumns
);

// Socket info records
router.get(
    "/",
    getSocketInfo
);

// Single record
router.get(
    "/:id",
    getSocketInfoById
);

module.exports = router;