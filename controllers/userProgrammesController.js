const { client } = require("../db");

// Fetch all user programmes
const getAllUserProgrammes = async (req, res) => {
  try {
    const { rows } = await client.query("SELECT * FROM user_programmes");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching user programmes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new user programme
const createUserProgramme = async (req, res) => {
  const { user_id, programme_id, start_date, active_days } = req.body;

  // Check active days and active programme constraints
  try {
    // Check how many active days the user currently has
    const activeProgrammes = await client.query(
      `
      SELECT active_days FROM user_programmes 
      WHERE user_id = $1 AND status = 'active'
    `,
      [user_id]
    );

    const activeDaysCount = activeProgrammes.rows.reduce((count, programme) => {
      return count + programme.active_days.split(",").length;
    }, 0);

    const newProgrammeDaysCount = active_days.split(",").length;
    const totalDays = activeDaysCount + newProgrammeDaysCount;

    // Constraint 1: Total active days cannot exceed 5
    if (totalDays > 5) {
      return res.status(400).json({
        message: "Total active days for all programmes cannot exceed 5.",
      });
    }

    // Constraint 2: If the user has only one active programme, it can have up to 3 active days
    if (activeProgrammes.rows.length === 1 && newProgrammeDaysCount > 3) {
      return res.status(400).json({
        message: "Only one active programme can have up to 3 active days.",
      });
    }

    // Insert the new user programme
    const { rows } = await client.query(
      `
      INSERT INTO user_programmes (user_id, programme_id, start_date, active_days, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `,
      [user_id, programme_id, start_date, active_days]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating user programme:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user programme by ID
const updateUserProgrammeById = async (req, res) => {
  const programmeId = req.params.id;
  const { start_date, status, active_days } = req.body;

  // Fetch the user_id for the provided programme
  try {
    const userProgramme = await client.query(
      "SELECT user_id FROM user_programmes WHERE id = $1",
      [programmeId]
    );

    if (userProgramme.rows.length === 0) {
      return res.status(404).json({ message: "User programme not found" });
    }

    const userId = userProgramme.rows[0].user_id;

    // Check active days and active programme constraints
    const activeProgrammes = await client.query(
      `
      SELECT active_days FROM user_programmes 
      WHERE user_id = $1 AND status = 'active' AND id != $2
    `,
      [userId, programmeId]
    );

    const activeDaysCount = activeProgrammes.rows.reduce((count, programme) => {
      return count + programme.active_days.split(",").length;
    }, 0);

    const newProgrammeDaysCount = active_days.split(",").length;
    const totalDays = activeDaysCount + newProgrammeDaysCount;

    // Constraint 1: Total active days cannot exceed 5
    if (totalDays > 5) {
      return res.status(400).json({
        message: "Total active days for all programmes cannot exceed 5.",
      });
    }

    // Constraint 2: If the user has only one active programme, it can have up to 3 active days
    if (activeProgrammes.rows.length === 1 && newProgrammeDaysCount > 3) {
      return res.status(400).json({
        message: "Only one active programme can have up to 3 active days.",
      });
    }

    // Update the user programme
    const { rows } = await client.query(
      `
      UPDATE user_programmes 
      SET start_date = $1, status = $2, active_days = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `,
      [start_date, status, active_days, programmeId]
    );

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error updating user programme:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user programme by ID
const deleteUserProgrammeById = async (req, res) => {
  const programmeId = req.params.id;

  try {
    const { rows } = await client.query(
      "DELETE FROM user_programmes WHERE id = $1 RETURNING *;",
      [programmeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User programme not found" });
    }
    res.status(200).json({ message: "User programme deleted successfully" });
  } catch (error) {
    console.error("Error deleting user programme:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUserProgrammes,
  createUserProgramme,
  updateUserProgrammeById,
  deleteUserProgrammeById,
};
