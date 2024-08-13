const express = require("express");
const router = express.Router();
const exerciseInstructionsController = require("../controllers/exerciseInstructionsController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

router.get(
  "/get/all",
  exerciseInstructionsController.getAllExerciseInstructions
);
router.get(
  "/get/id/:exercise_id",
  exerciseInstructionsController.getExerciseInstructionsByExerciseId
);
router.post(
  "/create",
  authenticateToken,
  isAdmin,
  exerciseInstructionsController.createExerciseInstruction
);

module.exports = router;
