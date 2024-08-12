const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const programmesController = require("../controllers/programmesController");

// Routes related to programmes
router.get("/get/all", programmesController.getAllProgrammes);
router.get(
  "/get/:id",
  programmesController.getProgrammeById
);
router.post(
  "/create",
  authenticateToken,
  programmesController.createProgramme
);

module.exports = router;
