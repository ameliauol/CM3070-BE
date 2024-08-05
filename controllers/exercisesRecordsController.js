const { client } = require("../db");

const getAllExerciseRecordsForUserExercises = async (req, res) => {
  try {
    const { rows } = await client.query("SELECT * FROM exercise_records");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No exercise records found." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all exercise records for a specific user exercise
const getAllExerciseRecordsForUserExerciseId = async (req, res) => {
  const userExerciseId = req.params.id;

  try {
    const { rows } = await client.query(
      "SELECT * FROM exercise_records WHERE user_exercise_id = $1",
      [userExerciseId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise records found for this user exercise." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new exercise record for a specific user exercise
const addExerciseRecordForUserExercise = async (req, res) => {
  const userExerciseId = req.params.id;
  const { weight } = req.body;

  try {
    // Check if the user exercise exists
    const userExercise = await client.query(
      "SELECT * FROM user_exercises WHERE id = $1",
      [userExerciseId]
    );

    if (userExercise.rows.length === 0) {
      return res.status(404).json({ message: "User exercise data not found." });
    }

    const { rows } = await client.query(
      `
      INSERT INTO exercise_records (user_exercise_id, weight)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [userExerciseId, weight]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding exercise record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an exercise record by record ID
const deleteRecord = async (req, res) => {
  const recordId = req.params.id;

  try {
    // Delete the exercise record
    const { rows } = await client.query(
      "DELETE FROM exercise_records WHERE id = $1 RETURNING *;",
      [recordId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Exercise record not found." });
    }

    res.status(200).json({ message: "Exercise record deleted successfully." });
  } catch (error) {
    console.error("Error deleting exercise record:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllExerciseRecordsForUserExercises,
  getAllExerciseRecordsForUserExerciseId,
  addExerciseRecordForUserExercise,
  deleteRecord,
};
