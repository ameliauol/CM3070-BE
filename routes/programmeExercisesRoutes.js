const express = require("express");
const router = express.Router();
const programmeExercisesController = require("../controllers/programmeExercisesController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Routes related to programme exercises
router.get(
  "/get/id/:id",
  programmeExercisesController.getAllExercisesOfProgrammeId
);
router.post(
  "/add/id/:id",
  authenticateToken,
  isAdmin,
  programmeExercisesController.addExerciseToProgramme
);

module.exports = router;
