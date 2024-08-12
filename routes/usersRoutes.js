const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);
router.get("/get/all", isAdmin, usersController.getAllUsers);
router.get(
  "/get/:username",
  authenticateToken,
  usersController.getUserByUsername
);
router.put(
  "/update/:currUsername",
  authenticateToken,
  usersController.updateUserByUsername
);
router.delete(
  "/delete/:username",
  authenticateToken,
  usersController.deleteUserByUsername
);

module.exports = router;
