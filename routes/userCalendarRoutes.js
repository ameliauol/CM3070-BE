const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");
const authenticateToken = require("../middleware/authenticateToken");

// Get the user's weekly calendar with assigned programmes
router.get("/", authenticateToken, calendarController.getUserCalendar);

// Assign a programme to a specific day on the calendar
router.post("/", authenticateToken, calendarController.assignProgramme);

// Update a specific calendar entry
router.put("/:id", authenticateToken, calendarController.updateCalendarEntry);

// Delete a specific calendar entry
router.delete(
  "/:id",
  authenticateToken,
  calendarController.deleteCalendarEntry
);

module.exports = router;
