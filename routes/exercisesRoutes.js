const express = require("express");
const router = express.Router();
const exercisesController = require("../controllers/exercisesController");

// Routes related to exercises
router.get("/exercises", exercisesController.getAllExercises);
router.post("/exercises", exercisesController.createExercise);

module.exports = router;
