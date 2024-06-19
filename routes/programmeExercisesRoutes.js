const express = require("express");
const router = express.Router();
const programmeExercisesController = require("../controllers/programmeExercisesController");

// Routes related to programme exercises
router.get("/get/all", programmeExercisesController.getAllExercisesInProgramme);
router.post("/create", programmeExercisesController.createProgrammeExercise);

module.exports = router;
