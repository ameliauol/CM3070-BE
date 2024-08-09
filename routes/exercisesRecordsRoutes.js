const express = require("express");
const router = express.Router();
const exercisesRecordsController = require("../controllers/exercisesRecordsController");

// Routes related to exercise records
router.get(
  "/get/all",
  exercisesRecordsController.getAllExerciseRecordsForUserExercises
);
router.get(
  "/get/filter/user-exercise/:id",
  exercisesRecordsController.getAllExerciseRecordsForUserExerciseId
);
router.post(
  "/add/new/:id",
  exercisesRecordsController.addExerciseRecordForUserExercise
);
router.delete(
  "/delete/:id",
  exercisesRecordsController.deleteExerciseRecordById
);

module.exports = router;
