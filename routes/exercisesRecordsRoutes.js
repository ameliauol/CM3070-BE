const express = require("express");
const router = express.Router();
const exercisesRecordsController = require("../controllers/exercisesRecordsController");

// Routes related to exercise records
router.get(
  "/get/all",
  exercisesRecordsController.getAllExerciseRecordsForUserExercises
);
router.get(
  "/get/:id",
  exercisesRecordsController.getAllExerciseRecordsForUserExerciseId
);
router.post(
  "/add/new/:id",
  exercisesRecordsController.addExerciseRecordForUserExercise
);
router.delete("/delete/:id", exercisesRecordsController.deleteRecord);

module.exports = router;
