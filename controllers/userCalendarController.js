const { client } = require("../db");

// Get all calendar entries for a user
exports.getAllCalendarEntriesForUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const calendarEntries = await client.query(
      "SELECT * FROM user_calendar WHERE user_id = $1",
      [userId]
    );
    res.json(calendarEntries.rows);
  } catch (error) {
    console.error("Error fetching calendar entries for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new calendar entry for a user
exports.addCalendarEntryForUser = async (req, res) => {
  const userId = req.params.id;
  const { date, programme_id } = req.body;
  try {
    const newCalendarEntry = await client.query(
      "INSERT INTO user_calendar (user_id, date, programme_id) VALUES ($1, $2, $3) RETURNING *",
      [userId, date, programme_id]
    );
    res.status(201).json(newCalendarEntry.rows[0]);
  } catch (error) {
    console.error("Error adding calendar entry for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
