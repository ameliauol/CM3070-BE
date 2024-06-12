const express = require("express");
const router = express.Router();
const programmeController = require("../controllers/programmeController");
const authenticateToken = require("../middleware/authenticateToken");

// Get available programmes
router.get("/", programmeController.getAllProgrammes);

// Get programme details by ID
router.get("/:id", programmeController.getProgrammeById);

// Create a new programme
router.post("/", authenticateToken, programmeController.createProgramme);

module.exports = router;
