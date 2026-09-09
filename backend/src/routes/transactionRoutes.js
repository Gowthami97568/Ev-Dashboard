const express = require("express");

const {
    getTransactions,
    getTransactionById,
    getTransactionSummary,
    getTransactionFilters,
    updateTransaction
} = require("../controllers/transactionController");

const router = express.Router();

// ======================================================
// GET TRANSACTION SUMMARY
// GET /api/charge-transactions/summary
// ======================================================

router.get(
    "/summary",
    getTransactionSummary
);

// ======================================================
// GET TRANSACTION FILTERS
// GET /api/charge-transactions/filters
// ======================================================

router.get(
    "/filters",
    getTransactionFilters
);

// ======================================================
// GET ALL TRANSACTIONS
// GET /api/charge-transactions
// ======================================================

router.get(
    "/",
    getTransactions
);

// ======================================================
// UPDATE TRANSACTION
// PUT /api/charge-transactions/:transactionid
// ======================================================

router.put(
    "/:transactionid",
    updateTransaction
);

// ======================================================
// GET SINGLE TRANSACTION
// GET /api/charge-transactions/:transactionid
// ======================================================

router.get(
    "/:transactionid",
    getTransactionById
);

module.exports = router;