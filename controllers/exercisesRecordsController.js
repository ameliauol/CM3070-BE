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

const getExerciseRecordsByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    // 1. Check if the user is authorized to access the exercise records
    if (userId !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: "Unauthorized to access exercise records for this user.",
      });
    }

    // 2. Fetch exercise records for the user
    const exerciseRecordsResult = await client.query(
      `
      SELECT er.*, 
             ue.start_weight, ue.goal_weight, ue.start_reps, ue.goal_reps,
             e.name AS exercise_name, e.is_weighted, e.category AS exercise_category,
             e.image_url AS exercise_image, 
             p.name AS programme_name
      FROM exercise_records er
      JOIN user_exercises ue ON er.user_exercise_id = ue.id
      JOIN exercises e ON ue.exercise_id = e.id
      JOIN user_programmes up ON ue.user_programme_id = up.id
      JOIN programmes p ON up.programme_id = p.id
      WHERE up.user_id = $1
      ORDER BY er.date_achieved DESC
      `,
      [userId]
    );

    if (exerciseRecordsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise records found for this user." });
    }

    res.status(200).json(exerciseRecordsResult.rows);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExerciseRecordsByProgrammeIdForLoggedInUser = async (req, res) => {
  const programmeId = req.params.programmeId;
  const userId = req.user.id;

  try {
    // 1. Check if the user is authorized to access the exercise records
    const authorizationCheck = await client.query(
      `
      SELECT 1
      FROM user_programmes
      WHERE user_id = $1 AND programme_id = $2
      `,
      [userId, programmeId]
    );

    if (authorizationCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Unauthorized to access exercise records for this programme.",
      });
    }

    // 2. If authorized, fetch the exercise records
    const exerciseRecordsResult = await client.query(
      `
      SELECT er.*, 
             ue.start_weight, ue.goal_weight, ue.start_reps, ue.goal_reps,
             e.name AS exercise_name, e.is_weighted, e.category AS exercise_category,
             e.image_url AS exercise_image, 
             p.name AS programme_name
      FROM exercise_records er
      JOIN user_exercises ue ON er.user_exercise_id = ue.id
      JOIN exercises e ON ue.exercise_id = e.id
      JOIN user_programmes up ON ue.user_programme_id = up.id
      JOIN programmes p ON up.programme_id = p.id
      WHERE up.user_id = $1 AND up.programme_id = $2
      ORDER BY er.date_achieved DESC
      `,
      [userId, programmeId]
    );

    if (exerciseRecordsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise records found for this program." });
    }

    res.status(200).json(exerciseRecordsResult.rows);
  } catch (error) {
    console.error("Error fetching exercise records:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  } else if (reps_completed < 0 || sets_completed < 0) {
    return res.status(400).json({
      error:
        "Reps completed and sets completed must be greater than or equal to 0",
    });
  }

  try {
    // Check if the user exercise exists and get is_weighted from exercises
    const userExerciseResult = await client.query(
      `
      SELECT ue.id, e.is_weighted
      FROM user_exercises ue
      JOIN exercises e ON ue.exercise_id = e.id
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

const addExerciseRecordForProgrammeId = async (req, res) => {
  const programmeId = req.params.programmeId;
  const { exercise_id, weight, reps_completed, sets_completed } = req.body; // Get exercise_id from body

  // Input Validation
  if (
    exercise_id === undefined ||
    reps_completed === undefined ||
    sets_completed === undefined
  ) {
    return res.status(400).json({
      error: "Exercise ID, reps completed, and sets completed are required",
    });
  } else if (reps_completed < 0 || sets_completed < 0) {
    return res.status(400).json({
      error:
        "Reps completed and sets completed must be greater than or equal to 0",
    });
  }

  try {
    // 1. Fetch the user_exercise_id for the given programmeId, exercise_id, and logged-in user
    const userExerciseResult = await client.query(
      `
      SELECT ue.id, e.is_weighted, e.name AS exercise_name
      FROM user_exercises ue
      JOIN exercises e ON ue.exercise_id = e.id
      WHERE ue.user_programme_id IN (SELECT id FROM user_programmes WHERE programme_id = $1 AND user_id = $2)
      AND ue.exercise_id = $3
      `,
      [programmeId, req.user.id, exercise_id]
    );

    if (userExerciseResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "No matching user exercise found for this programme and exercise, or this is not your data.",
      });
    }

    const userExerciseId = userExerciseResult.rows[0].id;
    const isWeighted = userExerciseResult.rows[0].is_weighted;
    const exerciseName = userExerciseResult.rows[0].exercise_name; // Get exercise name here

    // Validate weight based on is_weighted
    if (isWeighted && (weight === undefined || weight < 0)) {
      return res.status(400).json({
        error: `Weight is required for weighted exercise (${exerciseName}).`, // Use exerciseName
      });
    }

    // Determine weight value to be inserted
    let weightLifted = weight;
    if (!isWeighted) {
      weightLifted = null;
    }

    // 2. Insert the new exercise record
    const { rows: newExerciseRecord } = await client.query(
      `
      INSERT INTO exercise_records (user_exercise_id, weight, reps_completed, sets_completed)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [userExerciseId, weightLifted, reps_completed, sets_completed]
    );

    res.status(201).json(newExerciseRecord[0]);
  } catch (error) {
    console.error("Error adding exercise records:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  getExerciseRecordsByUserId,
  getExerciseRecordsByProgrammeIdForLoggedInUser,
  addExerciseRecordForUserExercise,
  addExerciseRecordForProgrammeId,
  deleteExerciseRecordById,
};
