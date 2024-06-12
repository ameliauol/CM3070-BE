const express = require("express");
const router = express.Router();
const exerciseRecordController = require("../controllers/exerciseRecordController");
const authenticateToken = require("../middleware/authenticateToken");

// Get all records for a specific user exercise
router.get(
  "/:id/records",
  authenticateToken,
  exerciseRecordController.getAllRecords
);

// Add a new record for a specific user exercise
router.post(
  "/:id/records",
  authenticateToken,
  exerciseRecordController.addNewRecord
);

// Delete a specific record
router.delete(
  "/:id/records/:record_id",
  authenticateToken,
  exerciseRecordController.deleteRecord
);

module.exports = router;
