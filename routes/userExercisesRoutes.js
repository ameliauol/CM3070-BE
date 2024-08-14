const express = require("express");
const router = express.Router();
const userExercisesController = require("../controllers/userExercisesController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Routes related to user exercises
router.get(
  "/get/all",
  authenticateToken,
  isAdmin,
  userExercisesController.getAllUserExercises
);
router.get(
  "/get/:id",
  authenticateToken,
  userExercisesController.getUserExercisesById
);
router.get(
  "/get/filter/user-programme/:id",
  authenticateToken,
  userExercisesController.getUserExercisesByUserProgrammeId
);
// Logged in users add for themselves
router.post(
  "/add/new/:id",
  authenticateToken,
  userExercisesController.addExerciseLogToUserProgramme
);
router.delete(
  "/delete/:id",
  authenticateToken,
  userExercisesController.deleteUserExerciseById
);

module.exports = router;
