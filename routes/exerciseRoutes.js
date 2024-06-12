const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exerciseController");
const authenticateToken = require("../middleware/authenticateToken");

// Get all exercises
router.get("/", exerciseController.getAllExercises);

// Create a new exercise
router.post("/", authenticateToken, exerciseController.createExercise);

module.exports = router;
