const { client } = require("../db");

// Fetch all exercise instructions
const getAllExerciseInstructions = async (req, res) => {
  try {
    const { rows } = await client.query(
      "SELECT * FROM exercise_instructions ORDER BY exercise_id, step_number"
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise instructions found." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching exercise instructions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch exercise instructions by exercise ID
const getExerciseInstructionsByExerciseId = async (req, res) => {
  const exerciseId = req.params.exercise_id;

  try {
    const { rows } = await client.query(
      "SELECT * FROM exercise_instructions WHERE exercise_id = $1 ORDER BY step_number",
      [exerciseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: `No instructions found for exercise ID ${exerciseId}.`,
      });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(
      "Error fetching exercise instructions by exercise ID:",
      error
    );
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new exercise instruction
const createExerciseInstruction = async (req, res) => {
  const { exercise_id, step_number, instruction } = req.body;

  try {
    // Check if the exercise exists
    const exerciseCheck = await client.query(
      "SELECT * FROM exercises WHERE id = $1",
      [exercise_id]
    );
    if (exerciseCheck.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found." });
    }

    // Insert the new exercise instruction
    const { rows } = await client.query(
      `
      INSERT INTO exercise_instructions (exercise_id, step_number, instruction, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
      `,
      [exercise_id, step_number, instruction]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating exercise instruction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllExerciseInstructions,
  getExerciseInstructionsByExerciseId,
  createExerciseInstruction,
};
