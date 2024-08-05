const { client } = require("../db");

// Get All User Exercises
exports.getAllUserExercises = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM user_exercises");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get User Exercises by filtering user programme ID (AND exercise ID)
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

    const { rows } = await client.query(query, queryParams);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No user exercises found for the specified criteria" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching user exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new exercise data/log to a user programme
exports.addExerciseLogToUserProgramme = async (req, res) => {
  const userProgrammeId = req.params.id;
  const { exercise_id, current_weight, goal_weight } = req.body;
  try {
    if (!userProgrammeId || !exercise_id || !current_weight || !goal_weight) {
      return res.status(400).json({
        error:
          "User Programme ID, Exercise ID, current weight and goal weight are required",
      });
    }

    const newUserExercise = await client.query(
      "INSERT INTO user_exercises (user_programme_id, exercise_id, current_weight, goal_weight) VALUES ($1, $2, $3, $4) RETURNING *",
      [userProgrammeId, exercise_id, current_weight, goal_weight]
    );
    res.status(201).json(newUserExercise.rows[0]);
  } catch (error) {
    console.error("Error adding exercise to user programme:", error);
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
