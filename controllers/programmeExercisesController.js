const { client } = require("../setup/db");

// Get all exercises in a programme
exports.getAllExercisesOfProgrammeId = async (req, res) => {
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

exports.addExerciseToProgramme = async (req, res) => {
  const programmeId = req.params.id;
  const { exercise_id, sets, reps } = req.body;

  if (!exercise_id || !sets || !reps) {
    return res.status(400).json({
      error: "Exercise ID, sets, and reps are required.",
    });
  }

  try {
    // Check if the programme and exercise exist
    const programmeAndExerciseCheck = await client.query(
      `
      SELECT p.id AS programme_id, e.id AS exercise_id
      FROM programmes p
      JOIN exercises e ON true
      WHERE p.id = $1 AND e.id = $2
      `,
      [programmeId, exercise_id]
    );

    if (programmeAndExerciseCheck.rows.length === 0) {
      return res.status(404).json({
        error:
          "Programme or exercise not found. Please ensure both IDs are valid.",
      });
    }

    // Check if the exercise already exists in the programme
    const exerciseInProgrammeCheck = await client.query(
      "SELECT id FROM programme_exercises WHERE programme_id = $1 AND exercise_id = $2",
      [programmeId, exercise_id]
    );
    if (exerciseInProgrammeCheck.rows.length > 0) {
      return res.status(400).json({
        error: `Exercise ${exercise_id} already exists in programme ${programmeId}1.`,
      });
    }

    // Add the exercise to the programme
    const createdProgrammeExercise = await client.query(
      "INSERT INTO programme_exercises (programme_id, exercise_id, sets, reps) VALUES ($1, $2, $3, $4) RETURNING *",
      [programmeId, exercise_id, sets, reps]
    );

    res.status(201).json(createdProgrammeExercise.rows[0]);
  } catch (error) {
    console.error("Error adding exercise to programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
