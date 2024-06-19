const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/register", usersController.registerUser); // Register new user
router.post("/login", usersController.loginUser); // Login user
router.get("/all", usersController.getAllUsers); // Get all users
router.get("/:id", authenticateToken, usersController.getUserById); // Get user by ID
router.put("/:id", authenticateToken, usersController.updateUserById); // Update user by ID
router.delete("/:id", authenticateToken, usersController.deleteUserById); // Delete user by ID

module.exports = router;
