const express = require("express");
const {
    getPermissionRows,
    upsertPermissions,
    requirePermissionAdministrator
} = require("../controllers/permissionsController");

const router = express.Router();

router.get("/", getPermissionRows);
router.put("/:userId", requirePermissionAdministrator, upsertPermissions);

module.exports = router;
