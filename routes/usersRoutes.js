const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middleware/authenticateToken");

router.post("/register", usersController.registerUser); // Register new user
router.post("/login", usersController.loginUser); // Login user
router.get("/get/all", usersController.getAllUsers); // Get all users
router.get(
  "/get/:username",
  authenticateToken,
  usersController.getUserByUsername
); // Get user by username
router.put(
  "/update/:currUsername",
  authenticateToken,
  usersController.updateUserByUsername
); // Update user by curr username
router.delete(
  "/delete/:username",
  authenticateToken,
  usersController.deleteUserByUsername
); // Delete user by username

module.exports = router;
