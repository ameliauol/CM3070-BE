const express = require("express");
const router = express.Router();
const availableProgrammesController = require("../controllers/availableProgrammesController");

// Routes related to available programmes
router.get(
  "/available_programmes",
  availableProgrammesController.getAllAvailableProgrammes
);
router.post(
  "/available_programmes",
  availableProgrammesController.createProgramme
);

module.exports = router;
