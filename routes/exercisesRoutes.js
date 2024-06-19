const express = require("express");
const router = express.Router();
const exercisesController = require("../controllers/exercisesController");

// Routes related to exercises
router.get("/get/all", exercisesController.getAllExercises);
router.post("/create", exercisesController.createExercise);

module.exports = router;
