const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const availableProgrammesController = require("../controllers/availableProgrammesController");

// Routes related to available programmes
router.get("/get/all", availableProgrammesController.getAllAvailableProgrammes);
router.post(
  "/create",
  authenticateToken,
  availableProgrammesController.createProgramme
);

module.exports = router;
