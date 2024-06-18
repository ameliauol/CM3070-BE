const express = require("express");
const router = express.Router();
const exerciseInstructionsController = require("../controllers/exerciseInstructionsController");

// Routes related to exercise instructions
router.get(
  "/exercise_instructions",
  exerciseInstructionsController.getAllExerciseInstructions
);
router.get(
  "/exercise_instructions/:exercise_id",
  exerciseInstructionsController.getExerciseInstructionsByExerciseId
);
router.post(
  "/exercise_instructions",
  exerciseInstructionsController.createExerciseInstruction
);

module.exports = router;
