const express = require("express");
const router = express.Router();
const exercisesRecordsController = require("../controllers/exercisesRecordsController");

// Routes related to exercise records
router.get(
  "/exercise_records/:id",
  exercisesRecordsController.getAllExerciseRecordsForUserExercise
);
router.post(
  "/exercise_records/:id",
  exercisesRecordsController.addExerciseRecordForUserExercise
);
router.delete(
  "/exercise_records/:record_id",
  exercisesRecordsController.deleteRecord
);

module.exports = router;
