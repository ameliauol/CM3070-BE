const pool = require("../db");

// Get all exercises
exports.getAllExercises = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exercises");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new exercise
exports.createExercise = async (req, res) => {
  const { name, category, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO exercises (name, category, description) VALUES ($1, $2, $3) RETURNING *",
      [name, category, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
