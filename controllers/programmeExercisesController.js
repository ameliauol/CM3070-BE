const { client } = require("../db");

// Get all exercises in a programme
exports.getAllExercisesInProgramme = async (req, res) => {
  const programmeId = req.params.id;
  try {
    const exercises = await client.query(
      "SELECT * FROM programme_exercises WHERE programme_id = $1",
      [programmeId]
    );
    res.json(exercises.rows);
  } catch (error) {
    console.error("Error fetching exercises in programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new exercise to a programme
exports.createProgrammeExercise = async (req, res) => {
  const programmeId = req.params.id;
  const { exercise_id } = req.body;
  try {
    const newProgrammeExercise = await client.query(
      "INSERT INTO programme_exercises (programme_id, exercise_id) VALUES ($1, $2) RETURNING *",
      [programmeId, exercise_id]
    );
    res.status(201).json(newProgrammeExercise.rows[0]);
  } catch (error) {
    console.error("Error adding exercise to programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
