const express = require("express");

const {
    getAppVersionSummary,
    getAppVersionColumns,
    getAppVersions,
    getAppVersionById
} = require("../controllers/appVersionController");

const router = express.Router();

// Summary
router.get(
    "/summary",
    getAppVersionSummary
);

// Actual database columns
router.get(
    "/columns",
    getAppVersionColumns
);

// App version records
router.get(
    "/",
    getAppVersions
);

// Single record
router.get(
    "/:id",
    getAppVersionById
);

module.exports = router;