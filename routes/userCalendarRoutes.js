const express = require("express");
const router = express.Router();
const userCalendarController = require("../controllers/userCalendarController");

// Routes related to user calendar
router.get(
  "/user_calendar/:id",
  userCalendarController.getAllCalendarEntriesForUser
);
router.post(
  "/user_calendar/:id",
  userCalendarController.addCalendarEntryForUser
);

module.exports = router;
