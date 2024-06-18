const express = require("express");
const router = express.Router();
const userProgrammesController = require("../controllers/userProgrammesController");

// Routes related to user programmes
router.get("/user_programmes", userProgrammesController.getAllUserProgrammes);
router.post("/user_programmes", userProgrammesController.createUserProgramme);
router.put(
  "/user_programmes/:id",
  userProgrammesController.updateUserProgrammeById
);
router.delete(
  "/user_programmes/:id",
  userProgrammesController.deleteUserProgrammeById
);

module.exports = router;
