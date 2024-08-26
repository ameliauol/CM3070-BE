const { client } = require("../setup/db");

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
  const { name, category, description, is_weighted, image_url, video_url } =
    req.body;

  if (
    !name ||
    !category ||
    !description ||
    is_weighted === undefined ||
    !image_url ||
    !video_url
  ) {
    // Validate is_weighted
    return res.status(400).json({
      error:
        "Name, category, description, is_weighted and image_url are required",
    });
  }

  const lowercaseCategory = category.toLowerCase();

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
    ].includes(lowercaseCategory)
  ) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const createdExercise = await client.query(
      "INSERT INTO exercises (name, category, description, is_weighted, image_url, video_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, lowercaseCategory, description, is_weighted, image_url, video_url]
    );
    res.status(201).json(createdExercise.rows[0]);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
