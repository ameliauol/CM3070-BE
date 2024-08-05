const express = require("express");
const router = express.Router();
const userExercisesController = require("../controllers/userExercisesController");
const { authenticateToken } = require("../middleware/authenticateToken");

// Routes related to user exercises
router.get("/get/all", userExercisesController.getAllUserExercises);
router.get(
  "/get/filter/:id",
  // authenticateToken,
  userExercisesController.getUserExercisesByUserProgrammeId
);
router.post(
  "/add/new/:id",
  userExercisesController.addExerciseLogToUserProgramme
);
router.delete("/delete/:id", userExercisesController.deleteUserExerciseById);

module.exports = router;
