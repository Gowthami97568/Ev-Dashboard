const express = require("express");

const {
    getWalletSummary,
    getWalletColumns,
    getWalletHistory,
    getWalletById
} = require("../controllers/walletController");

const router = express.Router();

// Summary
router.get(
    "/summary",
    getWalletSummary
);

// Actual database columns
router.get(
    "/columns",
    getWalletColumns
);

// Wallet history records
router.get(
    "/",
    getWalletHistory
);

// Single wallet record
router.get(
    "/:id",
    getWalletById
);

module.exports = router;