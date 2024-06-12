const express = require("express");
const router = express.Router();
const userProgrammeController = require("../controllers/userProgrammeController");
const authenticateToken = require("../middleware/authenticateToken");

// Get user's programmes
router.get("/", authenticateToken, userProgrammeController.getUserProgrammes);

// Start a new programme for the user
router.post("/", authenticateToken, userProgrammeController.startNewProgramme);

// Get details of a specific user programme
router.get(
  "/:id",
  authenticateToken,
  userProgrammeController.getUserProgrammeById
);

// Delete a user programme
router.delete(
  "/:id",
  authenticateToken,
  userProgrammeController.deleteUserProgramme
);

// User exercises routes

// Get user-specific exercise details within a programme
router.get(
  "/:id/exercises",
  authenticateToken,
  userProgrammeController.getUserSpecificExerciseDetails
);

// Update the current weight for a user exercise
router.put(
  "/:id/exercises/:exercise_id",
  authenticateToken,
  userProgrammeController.updateCurrentWeight
);

// Add a record of a lift weight for a user exercise
router.post(
  "/:id/exercises/:exercise_id/records",
  authenticateToken,
  userProgrammeController.addExerciseRecord
);

module.exports = router;
