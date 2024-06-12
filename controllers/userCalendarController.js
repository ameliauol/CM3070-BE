const pool = require("../database/db");

// Get the user's weekly calendar with assigned programmes
exports.getUserCalendar = async (req, res) => {
  const userId = req.user.id;

  try {
    const userCalendar = await pool.query(
      "SELECT * FROM user_calendar WHERE user_id = $1",
      [userId]
    );

    res.json(userCalendar.rows);
  } catch (error) {
    console.error("Error fetching the user's weekly calendar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Assign a programme to a specific day on the calendar
exports.assignProgramme = async (req, res) => {
  const { programme_id, date } = req.body;
  const userId = req.user.id;

  try {
    const newUserCalendarEntry = await pool.query(
      "INSERT INTO user_calendar (user_id, programme_id, date) VALUES ($1, $2, $3) RETURNING *",
      [userId, programme_id, date]
    );

    res.status(201).json(newUserCalendarEntry.rows[0]);
  } catch (error) {
    console.error(
      "Error assigning a programme to a specific day on the calendar:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a specific calendar entry
exports.updateCalendarEntry = async (req, res) => {
  const calendarEntryId = req.params.id;
  const { programme_id, date } = req.body;
  const userId = req.user.id;

  try {
    const updatedCalendarEntry = await pool.query(
      "UPDATE user_calendar SET programme_id = $1, date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *",
      [programme_id, date, calendarEntryId, userId]
    );

    if (updatedCalendarEntry.rows.length === 0) {
      return res.status(404).json({ error: "Calendar entry not found" });
    }
    res.json(updatedCalendarEntry.rows[0]);
  } catch (error) {
    console.error("Error updating a specific calendar entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a specific calendar entry
exports.deleteCalendarEntry = async (req, res) => {
  const calendarEntryId = req.params.id;
  const userId = req.user.id;

  try {
    const deletedCalendarEntry = await pool.query(
      "DELETE FROM user_calendar WHERE id = $1 AND user_id = $2 RETURNING *",
      [calendarEntryId, userId]
    );

    if (deletedCalendarEntry.rows.length === 0) {
      return res.status(404).json({ error: "Calendar entry not found" });
    }
    res.json(deletedCalendarEntry.rows[0]);
  } catch (error) {
    console.error("Error deleting a specific calendar entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
