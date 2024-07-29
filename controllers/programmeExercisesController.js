const { client } = require("../db");

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
  const { exercise_id } = req.body;

  try {
    // Check if the programme exists
    const programmeCheck = await client.query(
      "SELECT id FROM available_programmes WHERE id = $1",
      [programmeId]
    );
    if (programmeCheck.rows.length === 0) {
      return res.status(404).json({
        error:
          "Programme not found/is invalid, please create the programme first.",
      });
    }

    // Check if the exercise exists
    const exerciseCheck = await client.query(
      "SELECT id FROM exercises WHERE id = $1",
      [exercise_id]
    );
    if (exerciseCheck.rows.length === 0) {
      return res.status(404).json({
        error:
          "Exercise not found/is invalid, please create the exercise first.",
      });
    }

    const exerciseInProgrammeCheck = await client.query(
      "SELECT id FROM programme_exercises WHERE exercise_id = $1",
      [exercise_id]
    );
    if (exerciseInProgrammeCheck) {
      return res.status(400).json({
        error: "Exercise already exists in the programme.",
      });
    }

    // Add the exercise to the programme
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
