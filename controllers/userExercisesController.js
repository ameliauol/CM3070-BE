const { client } = require("../db");

// Get all exercises for a user programme
exports.getAllExercisesForUserProgramme = async (req, res) => {
  const userProgrammeId = req.params.id;
  try {
    const exercises = await client.query(
      "SELECT * FROM user_exercises WHERE user_programme_id = $1",
      [userProgrammeId]
    );
    res.json(exercises.rows);
  } catch (error) {
    console.error("Error fetching exercises for user programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new exercise to a user programme
exports.addExerciseToUserProgramme = async (req, res) => {
  const userProgrammeId = req.params.id;
  const { exercise_id, current_weight } = req.body;
  try {
    const newUserExercise = await client.query(
      "INSERT INTO user_exercises (user_programme_id, exercise_id, current_weight) VALUES ($1, $2, $3) RETURNING *",
      [userProgrammeId, exercise_id, current_weight]
    );
    res.status(201).json(newUserExercise.rows[0]);
  } catch (error) {
    console.error("Error adding exercise to user programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
