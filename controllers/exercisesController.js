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
  const { name, category, description } = req.body;

  if (!name || !category || !description) {
    res
      .status(400)
      .json({ error: "Name, category, and description are required" });
  }

  if (
    ![
      "chest",
      "back",
      "arms",
      "legs",
      "core",
      "full body",
      "shoulders",
      "others",
      "cardio",
    ].includes(category.toLowerCase())
  ) {
    res.status(400).json({ error: "Invalid category" });
  }
  try {
    const newExercise = await client.query(
      "INSERT INTO exercises (name, category, description) VALUES ($1, $2, $3) RETURNING *",
      [name, category.toLowerCase(), description]
    );
    res.status(201).json(newExercise.rows[0]);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
