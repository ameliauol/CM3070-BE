const { client } = require("../db");

// Get all exercises
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await client.query("SELECT * FROM exercises");
    res.json(exercises.rows);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new exercise
exports.createExercise = async (req, res) => {
  const { name, category, description, goal_weight } = req.body;
  try {
    const newExercise = await client.query(
      "INSERT INTO exercises (name, category, description, goal_weight) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, category, description, goal_weight]
    );
    res.status(201).json(newExercise.rows[0]);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
