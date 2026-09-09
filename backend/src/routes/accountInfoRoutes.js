const express = require("express");

const {
    getAccountInfoSummary,
    getAccountInfoColumns,
    getAccountInfo,
    getAccountInfoById
} = require("../controllers/accountInfoController");

const router = express.Router();

// Summary
router.get(
    "/summary",
    getAccountInfoSummary
);

// Real database columns
router.get(
    "/columns",
    getAccountInfoColumns
);

// Account info records
router.get(
    "/",
    getAccountInfo
);

// Single record
router.get(
    "/:id",
    getAccountInfoById
);

module.exports = router;