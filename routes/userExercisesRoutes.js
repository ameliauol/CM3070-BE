const express = require("express");
const router = express.Router();
const userExercisesController = require("../controllers/userExercisesController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// Routes related to user exercises
router.get(
  "/get/all",
  authenticateToken,
  isAdmin,
  userExercisesController.getAllUserExercises
);
router.get(
  "/get/:id",
  authenticateToken,
  userExercisesController.getUserExercisesById
);
router.get(
  "/get/filter/user-programme/:id",
  authenticateToken,
  userExercisesController.getUserExercisesByUserProgrammeId
);

router.get(
  "/get/filter/user/:user_id",
  authenticateToken,
  userExercisesController.getUserExercisesByUserId
);

// Logged in users add for themselves
router.post(
  "/add/new/:id",
  authenticateToken,
  userExercisesController.addExerciseLogToUserProgramme
);

router.put(
  "/update/:id",
  authenticateToken,
  userExercisesController.updateUserExerciseById
);

router.delete(
  "/delete/:id",
  authenticateToken,
  userExercisesController.deleteUserExerciseById
);

module.exports = router;
