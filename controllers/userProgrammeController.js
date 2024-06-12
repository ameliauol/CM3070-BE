const pool = require("../database/db");

// Get user's programmes
exports.getUserProgrammes = async (req, res) => {
  const userId = req.user.id;

  try {
    const userProgrammes = await pool.query(
      "SELECT * FROM user_programmes WHERE user_id = $1",
      [userId]
    );

    res.json(userProgrammes.rows);
  } catch (error) {
    console.error("Error fetching user programmes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Start a new programme for the user
exports.startNewProgramme = async (req, res) => {
  const { programme_id, start_date, days_per_week, active_days } = req.body;
  const userId = req.user.id;

  try {
    // Check if user has reached the limit of active programmes
    const activeProgrammesCount = await pool.query(
      "SELECT COUNT(*) FROM user_programmes WHERE user_id = $1 AND status = $2",
      [userId, "active"]
    );

    if (activeProgrammesCount.rows[0].count >= 3) {
      return res
        .status(400)
        .json({ error: "User already has 3 active programmes" });
    }

    const newUserProgramme = await pool.query(
      "INSERT INTO user_programmes (user_id, programme_id, start_date, status, days_per_week, active_days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, programme_id, start_date, "active", days_per_week, active_days]
    );

    res.status(201).json(newUserProgramme.rows[0]);
  } catch (error) {
    console.error("Error starting a new programme for the user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get details of a specific user programme
exports.getUserProgrammeById = async (req, res) => {
  const programmeId = req.params.id;

  try {
    const userProgramme = await pool.query(
      "SELECT * FROM user_programmes WHERE id = $1",
      [programmeId]
    );

    if (userProgramme.rows.length === 0) {
      return res.status(404).json({ error: "User programme not found" });
    }
    res.json(userProgramme.rows[0]);
  } catch (error) {
    console.error("Error fetching user programme details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a user programme
exports.deleteUserProgramme = async (req, res) => {
  const programmeId = req.params.id;
  const userId = req.user.id;

  try {
    const deletedProgramme = await pool.query(
      "DELETE FROM user_programmes WHERE id = $1 AND user_id = $2 RETURNING *",
      [programmeId, userId]
    );

    if (deletedProgramme.rows.length === 0) {
      return res.status(404).json({ error: "User programme not found" });
    }
    res.json(deletedProgramme.rows[0]);
  } catch (error) {
    console.error("Error deleting user programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user-specific exercise details within a programme
exports.getUserSpecificExerciseDetails = async (req, res) => {
  const programmeId = req.params.id;
  const userId = req.user.id;

  try {
    const userExercises = await pool.query(
      "SELECT * FROM user_exercises ue INNER JOIN user_programmes up ON ue.user_programme_id = up.id WHERE up.user_id = $1 AND up.id = $2",
      [userId, programmeId]
    );

    res.json(userExercises.rows);
  } catch (error) {
    console.error("Error fetching user-specific exercise details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update the current weight for a user exercise
exports.updateCurrentWeight = async (req, res) => {
  const programmeId = req.params.id;
  const exerciseId = req.params.exercise_id;
  const userId = req.user.id;
  const { current_weight } = req.body;

  try {
    const updatedExercise = await pool.query(
      "UPDATE user_exercises SET current_weight = $1, updated_at = CURRENT_TIMESTAMP WHERE user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $2 AND id = $3) AND exercise_id = $4 RETURNING *",
      [current_weight, userId, programmeId, exerciseId]
    );

    if (updatedExercise.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Exercise not found in the user programme" });
    }
    res.json(updatedExercise.rows[0]);
  } catch (error) {
    console.error("Error updating current weight for a user exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a record of a lift weight for a user exercise
exports.addExerciseRecord = async (req, res) => {
  const programmeId = req.params.id;
  const exerciseId = req.params.exercise_id;
  const userId = req.user.id;
  const { weight } = req.body;

  try {
    const newRecord = await pool.query(
      "INSERT INTO exercise_records (user_exercise_id, weight, date_achieved) VALUES ((SELECT id FROM user_exercises WHERE user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $1 AND id = $2) AND exercise_id = $3), $4, CURRENT_DATE) RETURNING *",
      [userId, programmeId, exerciseId, weight]
    );

    res.status(201).json(newRecord.rows[0]);
  } catch (error) {
    console.error(
      "Error adding a record of a lift weight for a user exercise:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};
