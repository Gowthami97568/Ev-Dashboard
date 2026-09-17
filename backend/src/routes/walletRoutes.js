const express = require("express");

const {
    getWalletSummary,
    getWalletColumns,
    getWalletHistory,
    getWalletById,
    updateWalletRecord
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

// Update a record without a database-generated ID by matching its original values
router.put(
    "/",
    updateWalletRecord
);

// Single wallet record
router.get(
    "/:id",
    getWalletById
);

// Update one wallet record
router.put(
    "/:id",
    updateWalletRecord
);

module.exports = router;