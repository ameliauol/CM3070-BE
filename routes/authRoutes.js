const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authenticateToken");

// Register a new user
router.post("/register", authController.registerUser);

// Login route
router.post("/login", authController.loginUser);

// Get user profile
router.get("/user/profile", authenticateToken, authController.getUserProfile);

// Update user profile
router.put(
  "/user/profile",
  authenticateToken,
  authController.updateUserProfile
);

module.exports = router;
