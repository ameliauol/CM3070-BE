const express = require("express");
const router = express.Router();
const userExercisesController = require("../controllers/userExercisesController");

// Routes related to user exercises
router.get(
  "/user_exercises/:id",
  userExercisesController.getAllExercisesForUserProgramme
);
router.post(
  "/user_exercises/:id",
  userExercisesController.addExerciseToUserProgramme
);

module.exports = router;
