const client = require("../db");

// Get all records for a specific user exercise
exports.getAllRecords = async (req, res) => {
  const exerciseId = req.params.id;
  const userId = req.user.id;

  try {
    const exerciseRecords = await client.query(
      "SELECT * FROM exercise_records WHERE user_exercise_id IN (SELECT id FROM user_exercises WHERE user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $1) AND exercise_id = $2)",
      [userId, exerciseId]
    );

    res.json(exerciseRecords.rows);
  } catch (error) {
    console.error(
      "Error fetching records for a specific user exercise:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new record for a specific user exercise
exports.addNewRecord = async (req, res) => {
  const exerciseId = req.params.id;
  const userId = req.user.id;
  const { weight } = req.body;

  try {
    const newRecord = await client.query(
      "INSERT INTO exercise_records (user_exercise_id, weight, date_achieved) VALUES ((SELECT id FROM user_exercises WHERE user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $1) AND exercise_id = $2), $3, CURRENT_DATE) RETURNING *",
      [userId, exerciseId, weight]
    );

    res.status(201).json(newRecord.rows[0]);
  } catch (error) {
    console.error(
      "Error adding a new record for a specific user exercise:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a specific record
exports.deleteRecord = async (req, res) => {
  const recordId = req.params.record_id;
  const userId = req.user.id;

  try {
    const deletedRecord = await client.query(
      "DELETE FROM exercise_records WHERE id = $1 AND user_exercise_id IN (SELECT id FROM user_exercises WHERE user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $2)) RETURNING *",
      [recordId, userId]
    );

    if (deletedRecord.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(deletedRecord.rows[0]);
  } catch (error) {
    console.error("Error deleting a specific record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
