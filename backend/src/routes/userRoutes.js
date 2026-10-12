const express = require("express");
const { requireModulePermission } = require("../controllers/permissionsController");

const {
    getAllUsers,
    updateUser
} = require("../controllers/userController");


const router = express.Router();


// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/",
    getAllUsers
);


// =====================================================
// UPDATE USER
// =====================================================

router.put(
    "/:id",
    requireModulePermission("User"),
    updateUser
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;