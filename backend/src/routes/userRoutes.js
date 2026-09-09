const express = require("express");

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
    updateUser
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;