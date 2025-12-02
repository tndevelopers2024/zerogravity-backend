// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    updateProfile,
    getUsers,
    getUserById,
    deleteUser
} = require("../controllers/userController");

// Logged-in user
router.put("/profile", protect, updateProfile);

// Admin
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
