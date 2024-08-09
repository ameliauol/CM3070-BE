const { client } = require("../db");

// Get All User Exercises
exports.getAllUserExercises = async (req, res) => {
  try {
    const { rows: userExercises } = await client.query(
      "SELECT * FROM user_exercises"
    );
    res.status(200).json(userExercises);
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserExercisesById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: userExercises } = await client.query(
      "SELECT * FROM user_exercises WHERE id = $1",
      [id]
    );
    if (userExercises.length === 0) {
      return res
        .status(404)
        .json({ error: "User exercise of specified ID not found" });
    }
    res.status(200).json(userExercises);
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get User Exercises by User Programme ID (with optional exercise ID)
exports.getUserExercisesByUserProgrammeId = async (req, res) => {
  const userProgrammeId = req.params.id;
  const { exercise_id } = req.body;

  if (!userProgrammeId) {
    return res.status(400).json({ error: "User Programme ID is required" });
  }

  try {
    let query = "SELECT * FROM user_exercises WHERE user_programme_id = $1";
    const queryParams = [userProgrammeId];

    // Additional filter if exercise_id is provided
    if (exercise_id) {
      query += " AND exercise_id = $2";
      queryParams.push(exercise_id);
    }

    const { rows: userExercises } = await client.query(query, queryParams);

    if (userExercises.length === 0) {
      return res
        .status(404)
        .json({ error: "No user exercises found for the specified criteria" });
    }

    res.status(200).json(userExercises);
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new exercise data/log to a user programme
exports.addExerciseLogToUserProgramme = async (req, res) => {
  const userProgrammeId = req.params.id;
  const { exercise_id, start_weight, goal_weight, start_reps, goal_reps } =
    req.body;

  try {
    // Check if the exercise exists in programme_exercises and get is_weighted
    const exerciseCheckResult = await client.query(
      `
      SELECT pe.exercise_id, e.is_weighted
      FROM programme_exercises pe
      JOIN exercises e ON pe.exercise_id = e.id
      JOIN user_programmes up ON pe.programme_id = up.programme_id
      WHERE up.id = $1 AND pe.exercise_id = $2
      `,
      [userProgrammeId, exercise_id]
    );

    if (exerciseCheckResult.rows.length === 0) {
      return res.status(400).json({
        error: "Exercise not found in the specified user program.",
      });
    }

    const isWeighted = exerciseCheckResult.rows[0].is_weighted;

    // Validate input based on is_weighted
    if (isWeighted) {
      // If it's a weighted exercise
      if (start_weight === undefined || goal_weight === undefined) {
        return res.status(400).json({
          error:
            "Start weight and goal weight are required for weighted exercises.",
        });
      }
    } else {
      // If it's not a weighted exercise
      if (start_reps === undefined || goal_reps === undefined) {
        return res.status(400).json({
          error:
            "Start reps and goal reps are required for non-weighted exercises.",
        });
      }
    }

    // Insert into user_exercises based on is_weighted
    let newUserExercise;
    if (isWeighted) {
      newUserExercise = await client.query(
        `
        INSERT INTO user_exercises (user_programme_id, exercise_id, start_weight, goal_weight) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
        `,
        [userProgrammeId, exercise_id, start_weight, goal_weight]
      );
    } else {
      newUserExercise = await client.query(
        `
        INSERT INTO user_exercises (user_programme_id, exercise_id, start_reps, goal_reps) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
        `,
        [userProgrammeId, exercise_id, start_reps, goal_reps]
      );
    }

    res.status(201).json(newUserExercise.rows[0]);
  } catch (error) {
    console.error("Error adding exercise to user program:", error);
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Invalid user program or exercise ID" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a User Exercise
exports.deleteUserExerciseById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query(
      "DELETE FROM user_exercises WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User exercise not found" });
    }

    res.status(200).json({ message: "User exercise deleted successfully" });
  } catch (error) {
    console.error("Error deleting user exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
