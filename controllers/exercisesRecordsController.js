const { client } = require("../setup/db");

// Get All Exercise Records
const getAllExerciseRecordsForUserExercises = async (req, res) => {
  try {
    const { rows: exerciseRecords } = await client.query(
      "SELECT * FROM exercise_records"
    );

    if (exerciseRecords.length === 0) {
      return res.status(404).json({ message: "No exercise records found." });
    }

    res.status(200).json(exerciseRecords);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch all exercise records for a specific user exercise
const getAllExerciseRecordsForUserExerciseId = async (req, res) => {
  const userExerciseId = req.params.id;

  try {
    const { rows: exerciseRecords } = await client.query(
      "SELECT * FROM exercise_records WHERE user_exercise_id = $1",
      [userExerciseId]
    );

    if (exerciseRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise records found for this user exercise." });
    }

    res.status(200).json(exerciseRecords);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a new exercise record for a specific user exercise
const addExerciseRecordForUserExercise = async (req, res) => {
  const userExerciseId = req.params.id;
  const { weight, reps_completed, sets_completed } = req.body;

  if (reps_completed === undefined || sets_completed === undefined) {
    return res.status(400).json({
      error: "Reps completed and sets completed are required",
    });
  }

  try {
    // Check if the user exercise exists and get is_weighted from exercises
    const userExerciseResult = await client.query(
      `
      SELECT ue.id, e.is_weighted
      FROM user_exercises ue
      JOIN programme_exercises e ON ue.exercise_id = e.exercise_id
      WHERE ue.id = $1
      `,
      [userExerciseId]
    );

    if (userExerciseResult.rows.length === 0) {
      return res.status(404).json({ message: "User exercise data not found." });
    }

    const isWeighted = userExerciseResult.rows[0].is_weighted;

    // Validate weight based on is_weighted
    if (isWeighted && weight === undefined) {
      return res.status(400).json({
        error: "Weight is required for weighted exercises.",
      });
    }

    // Determine weight value to be inserted
    let weightToInsert = weight;
    if (!isWeighted) {
      weightToInsert = null; // Ignore submitted weight if not weighted
    }

    // Insert the new exercise record
    const { rows: newExerciseRecord } = await client.query(
      `
      INSERT INTO exercise_records (user_exercise_id, weight, reps_completed, sets_completed)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [userExerciseId, weightToInsert, reps_completed, sets_completed]
    );

    res.status(201).json(newExerciseRecord[0]);
  } catch (error) {
    console.error("Error adding exercise record:", error);

    // More informative error message if foreign key constraint is violated
    if (error.code === "23503") {
      return res.status(400).json({ error: "Invalid user exercise ID" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete an exercise record by record ID
const deleteExerciseRecordById = async (req, res) => {
  const recordId = req.params.id;

  try {
    // Delete the exercise record
    const { rows: deletedRecord } = await client.query(
      "DELETE FROM exercise_records WHERE id = $1 RETURNING *;",
      [recordId]
    );

    if (deletedRecord.length === 0) {
      return res.status(404).json({ message: "Exercise record not found." });
    }

    res.status(200).json({ message: "Exercise record deleted successfully." });
  } catch (error) {
    console.error("Error deleting exercise record:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllExerciseRecordsForUserExercises,
  getAllExerciseRecordsForUserExerciseId,
  addExerciseRecordForUserExercise,
  deleteExerciseRecordById,
};
