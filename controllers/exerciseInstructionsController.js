const { client } = require("../setup/db");

// Fetch all exercise instructions
const getAllExerciseInstructions = async (req, res) => {
  try {
    const { rows: exerciseInstructions } = await client.query(
      "SELECT * FROM exercise_instructions ORDER BY exercise_id, step_number"
    );

    if (exerciseInstructions.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercise instructions found." });
    }

    res.status(200).json(exerciseInstructions);
  } catch (error) {
    console.error("Error fetching exercise instructions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch exercise instructions by exercise ID
const getExerciseInstructionsByExerciseId = async (req, res) => {
  const exerciseId = req.params.exercise_id;

  try {
    const { rows: instructions } = await client.query(
      "SELECT * FROM exercise_instructions WHERE exercise_id = $1 ORDER BY step_number",
      [exerciseId]
    );

    if (instructions.length === 0) {
      return res.status(404).json({
        message: `No instructions found for exercise ID ${exerciseId}.`,
      });
    }

    res.status(200).json(instructions);
  } catch (error) {
    console.error(
      "Error fetching exercise instructions by exercise ID:",
      error
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createExerciseInstruction = async (req, res) => {
  const { exercise_id, instruction } = req.body;

  try {
    const result = await client.query(
      `
      WITH max_step_number AS (
        SELECT COALESCE(MAX(step_number), 0) AS max_step_number
        FROM exercise_instructions
        WHERE exercise_id = $1
      )
      SELECT exercises.*, (SELECT max_step_number FROM max_step_number) + 1 AS next_step_number
      FROM exercises
      WHERE id = $1;
      `,
      [exercise_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found." });
    }

    const nextStepNumber = result.rows[0].next_step_number;

    // Insert the new exercise instruction
    const { rows: newInstruction } = await client.query(
      `
      INSERT INTO exercise_instructions (exercise_id, step_number, instruction, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
      `,
      [exercise_id, nextStepNumber, instruction]
    );

    res.status(201).json(newInstruction[0]);
  } catch (error) {
    console.error("Error creating exercise instruction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllExerciseInstructions,
  getExerciseInstructionsByExerciseId,
  createExerciseInstruction,
};
