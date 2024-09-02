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
  "/get/filter/user/:id",
  authenticateToken,
  exercisesRecordsController.getExerciseRecordsByUserId
);
router.get(
  "/get/filter/user-exercise/:id",
  authenticateToken,
  exercisesRecordsController.getAllExerciseRecordsForUserExerciseId
);
router.post(
  "/add/new/user-exercise/:id",
  authenticateToken,
  exercisesRecordsController.addExerciseRecordForUserExercise
);
router.post(
  "/add/new/programme/:programmeId",
  authenticateToken,
  exercisesRecordsController.addExerciseRecordForProgrammeId
);
router.delete(
  "/delete/:id",
  authenticateToken,
  exercisesRecordsController.deleteExerciseRecordById
);

module.exports = router;
