const express = require("express");
const {
    getInsights,
    getTransactionTrend,
    getEnergyTrend,
    getChargeValueTrend,
    getAutostartAnalytics,
    getPeakUsage,
    getTopChargers
} = require("../controllers/analyticsController");

const router = express.Router();

router.get(
    "/insights",
    getInsights
);

router.get(
    "/transaction-trend",
    getTransactionTrend
);

router.get(
    "/energy-trend",
    getEnergyTrend
);

router.get(
    "/charge-value-trend",
    getChargeValueTrend
);

router.get(
    "/autostart",
    getAutostartAnalytics
);

router.get(
    "/peak-usage",
    getPeakUsage
);

router.get(
    "/top-chargers",
    getTopChargers
);

module.exports = router;