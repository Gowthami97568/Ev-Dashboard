const express = require("express");

const {

    getConfigDataSummary,

    getConfigDataColumns,

    getConfigData,

    getConfigDataById,

    updateConfigData

} = require("../controllers/configDataController");


const router =
    express.Router();


// ======================================================
// SUMMARY
// ======================================================

router.get(
    "/summary",
    getConfigDataSummary
);


// ======================================================
// DATABASE COLUMNS
// ======================================================

router.get(
    "/columns",
    getConfigDataColumns
);


// ======================================================
// ALL CONFIG DATA
// ======================================================

router.get(
    "/",
    getConfigData
);


// ======================================================
// GET SINGLE RECORD
// ======================================================

router.get(
    "/:id",
    getConfigDataById
);


// ======================================================
// UPDATE SINGLE RECORD
// ======================================================

router.put(
    "/:id",
    updateConfigData
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;