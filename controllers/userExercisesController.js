const { client } = require("../setup/db");

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
  const userId = req.user.id;

  try {
    // 1. Check if the user is authorized to access the user exercise
    const authorizationCheck = await client.query(
      `
      SELECT 1
      FROM user_exercises 
      WHERE id = $1 AND user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $2)
      `,
      [id, userId]
    );

    if (authorizationCheck.rows.length === 0 && !req.user.is_admin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this user exercise" });
    }

    // 2. If authorized, fetch the user exercise
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

exports.getUserExercisesByUserProgrammeId = async (req, res) => {
  const userProgrammeId = req.params.id;
  const userId = req.user.id;
  const { exercise_id } = req.body;

  if (!userProgrammeId) {
    return res.status(400).json({ error: "User Programme ID is required" });
  }

  try {
    // 1. Check if the user is authorized to access the user programme
    const authorizationCheck = await client.query(
      `
      SELECT 1
      FROM user_programmes
      WHERE id = $1 AND user_id = $2
      `,
      [userProgrammeId, userId]
    );

    if (authorizationCheck.rows.length === 0 && !req.user.is_admin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access this user exercise" });
    }

    // 2. If authorized, fetch the user exercises
    let query = "SELECT * FROM user_exercises WHERE user_programme_id = $1";
    const queryParams = [userProgrammeId];

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

exports.getUserExercisesByUserId = async (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // 1. Check if the user is authorized to access the user programme
  if (userId !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({
      message:
        "Unauthorized request, you can only view user exercises for your own account or if you are an admin.",
    });
  }

  // 2. If authorized, fetch the user exercises
  try {
    const { rows: userExercises } = await client.query(
      `
      SELECT ue.*, e.name AS exercise_name, p.name AS programme_name
      FROM user_exercises ue
      JOIN user_programmes up ON ue.user_programme_id = up.id
      JOIN programmes p ON up.programme_id = p.id
      JOIN exercises e ON ue.exercise_id = e.id
      WHERE up.user_id = $1
      `,
      [userId]
    );

    if (userExercises.length === 0) {
      return res.status(404).json({
        message: `No user exercises found for user ID: ${userId}`,
      });
    }

    res.status(200).json(userExercises);
  } catch (error) {
    console.error("Error fetching user programmes by user ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
  const userId = req.user.id;

  try {
    // 1. Check if the user is authorized to delete the user exercise
    const authorizationCheck = await client.query(
      `
      SELECT 1
      FROM user_exercises 
      WHERE id = $1 AND user_programme_id IN (SELECT id FROM user_programmes WHERE user_id = $2)
      `,
      [id, userId]
    );

    if (authorizationCheck.rows.length === 0 && !req.user.is_admin) {
      // Not authorized and not admin
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this user exercise" });
    }

    // 2. If authorized, delete the user exercise
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
