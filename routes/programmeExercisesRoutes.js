const express = require("express");
const router = express.Router();
const programmeExercisesController = require("../controllers/programmeExercisesController");

// Routes related to programme exercises
router.get(
  "/programme_exercises",
  programmeExercisesController.getAllExercisesInProgramme
);
router.post(
  "/programme_exercises",
  programmeExercisesController.createProgrammeExercise
);

module.exports = router;
