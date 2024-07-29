const express = require("express");
const router = express.Router();
const exerciseInstructionsController = require("../controllers/exerciseInstructionsController");

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
  exerciseInstructionsController.createExerciseInstruction
);

module.exports = router;
