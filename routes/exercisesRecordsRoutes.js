const express = require("express");
const router = express.Router();
const exercisesRecordsController = require("../controllers/exercisesRecordsController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Routes related to exercise records
router.get(
  "/get/all",
  authenticateToken,
  isAdmin,
  exercisesRecordsController.getAllExerciseRecordsForUserExercises
);
router.get(
  "/get/filter/user-exercise/:id",
  authenticateToken,
  exercisesRecordsController.getAllExerciseRecordsForUserExerciseId
);
router.post(
  "/add/new/:id",
  authenticateToken,
  exercisesRecordsController.addExerciseRecordForUserExercise
);
router.delete(
  "/delete/:id",
  authenticateToken,
  exercisesRecordsController.deleteExerciseRecordById
);

module.exports = router;
