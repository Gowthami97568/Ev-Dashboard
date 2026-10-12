const express = require("express");
const { requireModulePermission } = require("../controllers/permissionsController");

const {
    getDeviceSummary,
    getDeviceColumns,
    getDevices,
    getDeviceById,
    updateDevice
} = require("../controllers/devicesMasterController");

const router = express.Router();


// ======================================================
// SUMMARY
// ======================================================

router.get(
    "/summary",
    getDeviceSummary
);


// ======================================================
// DATABASE COLUMNS
// ======================================================

router.get(
    "/columns",
    getDeviceColumns
);


// ======================================================
// DEVICE LIST
// ======================================================

router.get(
    "/",
    getDevices
);


// ======================================================
// UPDATE DEVICE
// ======================================================

router.put(
    "/:id",
    requireModulePermission("Device"),
    updateDevice
);


// ======================================================
// SINGLE DEVICE
// ======================================================

router.get(
    "/:id",
    getDeviceById
);


module.exports = router;