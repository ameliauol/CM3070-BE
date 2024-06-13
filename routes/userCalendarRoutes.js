const express = require("express");
const router = express.Router();
const userCalendarController = require("../controllers/userCalendarController");
const authenticateToken = require("../middleware/authenticateToken");

// Get the user's weekly calendar with assigned programmes
router.get("/", authenticateToken, userCalendarController.getUserCalendar);

// Assign a programme to a specific day on the calendar
router.post("/", authenticateToken, userCalendarController.assignProgramme);

// Update a specific calendar entry
router.put(
  "/:id",
  authenticateToken,
  userCalendarController.updateCalendarEntry
);

// Delete a specific calendar entry
router.delete(
  "/:id",
  authenticateToken,
  userCalendarController.deleteCalendarEntry
);

module.exports = router;
