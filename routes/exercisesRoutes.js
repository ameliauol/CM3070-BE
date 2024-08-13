const express = require("express");
const router = express.Router();
const exercisesController = require("../controllers/exercisesController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Routes related to exercises
router.get("/get/all", exercisesController.getAllExercises);
router.post(
  "/create",
  authenticateToken,
  isAdmin,
  exercisesController.createExercise
);

module.exports = router;
