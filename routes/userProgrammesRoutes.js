const express = require("express");
const router = express.Router();
const userProgrammesController = require("../controllers/userProgrammesController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Routes related to user programmes
router.get("/get/all", userProgrammesController.getAllUserProgrammes);
router.get("/get/:id", userProgrammesController.getUserProgrammeById);
router.get(
  "/get/user/:user_id",
  userProgrammesController.getUserProgrammesByUserId
);
router.post(
  "/join/:id",
  authenticateToken,
  userProgrammesController.addProgrammeToUser
);
router.put(
  "/update/:id",
  authenticateToken,
  userProgrammesController.updateUserProgrammeById
);
router.delete(
  "/delete/:id",
  authenticateToken,
  userProgrammesController.deleteUserProgrammeById
);

module.exports = router;
