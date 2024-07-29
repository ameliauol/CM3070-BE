const express = require("express");
const router = express.Router();
const programmeExercisesController = require("../controllers/programmeExercisesController");

// Routes related to programme exercises
router.get(
  "/get/id/:id",
  programmeExercisesController.getAllExercisesOfProgrammeId
);
router.post("/add/id/:id", programmeExercisesController.addExerciseToProgramme);

module.exports = router;
