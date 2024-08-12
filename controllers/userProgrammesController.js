const { client } = require("../setup/db");

// Fetch all user programmes
const getAllUserProgrammes = async (req, res) => {
  try {
    const { rows: userProgrammes } = await client.query(
      "SELECT * FROM user_programmes"
    );
    res.status(200).json(userProgrammes);
  } catch (error) {
    console.error("Error fetching user programmes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch user programmes by id
const getUserProgrammeById = async (req, res) => {
  const userProgrammeId = req.params.id;
  try {
    const { rows: userProgramme } = await client.query(
      "SELECT * FROM user_programmes WHERE id = $1",
      [userProgrammeId]
    );
    res.status(200).json(userProgramme);
  } catch (error) {
    console.error("Error fetching user programme by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch user programmes by user ID
const getUserProgrammesByUserId = async (req, res) => {
  const userId = req.params.user_id;

  try {
    const { rows: userProgrammes } = await client.query(
      "SELECT * FROM user_programmes WHERE user_id = $1",
      [userId]
    );

    if (userProgrammes.length === 0) {
      return res.status(404).json({
        message: `No programmes found for user ID: ${userId}`,
      });
    }

    res.status(200).json(userProgrammes);
  } catch (error) {
    console.error("Error fetching user programmes by user ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add existing programme to user
const addProgrammeToUser = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Please log in and provide an authorization token." });
  }

  const programmeId = req.params.id;
  let { start_date, active_days } = req.body;

  if (!start_date) {
    start_date = new Date().toISOString().split("T")[0];
  }

  if (!programmeId || !active_days) {
    return res.status(400).json({
      message:
        "Missing required fields, i.e. programme id in params/active_days.",
    });
  }

  try {
    active_days = active_days
      .split(",")
      .map((day) => day.trim().toLowerCase())
      .join(",");

    // Check if the programme exists and if the user has already joined
    const programmeAndUserCheck = await client.query(
      `
      SELECT p.id AS programme_id, up.id AS user_programme_id
      FROM programmes p
      LEFT JOIN user_programmes up ON p.id = up.programme_id AND up.user_id = $1
      WHERE p.id = $2
      `,
      [userId, programmeId]
    );

    if (programmeAndUserCheck.rows.length === 0) {
      return res.status(404).json({ message: "Programme not found." });
    }

    if (programmeAndUserCheck.rows[0].user_programme_id) {
      return res.status(400).json({
        message:
          "User has already joined this programme, please use the UPDATE function instead.",
      });
    }

    // Check active days constraint
    const activeDaysCountResult = await client.query(
      `
      SELECT SUM(LENGTH(active_days) - LENGTH(REPLACE(active_days, ',', '')) + 1) AS total_active_days
      FROM user_programmes
      WHERE user_id = $1 AND status = 'active'
      `,
      [userId]
    );

    const activeDaysCount =
      parseInt(activeDaysCountResult.rows[0].total_active_days) || 0;
    const newProgrammeDaysCount = active_days.split(",").length;
    const totalDays = activeDaysCount + newProgrammeDaysCount;

    // Constraint 1: Total active days cannot exceed 5
    if (totalDays > 5) {
      return res.status(400).json({
        message: "Total active days for all programmes cannot exceed 5.",
      });
    }

    // Constraint 2: If the user has only one active programme, it can have up to 3 active days
    if (activeDaysCount === 0 && newProgrammeDaysCount > 3) {
      return res.status(400).json({
        message: "Only one active programme can have up to 3 active days.",
      });
    }

    // Insert the new user programme
    const { rows: newUserProgramme } = await client.query(
      `
      INSERT INTO user_programmes (user_id, programme_id, start_date, active_days, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
      `,
      [userId, programmeId, start_date, active_days]
    );

    res.status(201).json(newUserProgramme[0]);
  } catch (error) {
    console.error("Error adding programme to user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProgrammeById = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Please log in and provide an authorization token." });
  }
  const programmeId = req.params.id;
  const { start_date, status, active_days } = req.body;

  try {
    // Fetch the current status of the programme
    const { rows: currentProgrammes } = await client.query(
      `
      SELECT * FROM user_programmes 
      WHERE programme_id = $1 AND user_id = $2
    `,
      [programmeId, userId]
    );

    if (currentProgrammes.length === 0) {
      return res.status(404).json({ message: "Programme not found." });
    }

    const currentStatus = currentProgrammes[0].status;

    // Check if the status change is valid
    if (status && status !== currentStatus) {
      if (
        (currentStatus === "active" && status !== "inactive") ||
        (currentStatus === "inactive" && status !== "active")
      ) {
        return res.status(400).json({
          message:
            "Status can only be changed between 'active' and 'inactive'.",
        });
      }
    }

    // Initialize an array to hold query fragments and values
    let queryFragments = [];
    let queryValues = [];
    let index = 1; // Index for parameterized queries

    // Conditional logic to build query fragments
    if (start_date) {
      queryFragments.push(`start_date = $${index}`);
      queryValues.push(start_date);
      index++;
    }
    if (status) {
      queryFragments.push(`status = $${index}`);
      queryValues.push(status);
      index++;
    }

    // Handle active_days update (overwrite existing values)
    if (active_days) {
      // Directly assign the new active days (ensuring lowercase)
      const newActiveDays = active_days
        .split(",")
        .map((day) => day.trim().toLowerCase())
        .join(",");

      queryFragments.push(`active_days = $${index}`);
      queryValues.push(newActiveDays);
      index++;

      // Check active days and active programme constraints
      const activeProgrammes = await client.query(
        `
        SELECT active_days FROM user_programmes 
        WHERE user_id = $1 AND status = 'active' AND programme_id != $2
      `,
        [userId, programmeId]
      );

      const activeDaysCount = activeProgrammes.rows.reduce(
        (count, programme) => {
          return count + programme.active_days.split(",").length;
        },
        0
      );

      const newProgrammeDaysCount = newActiveDays.split(",").length; // Use newActiveDays
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
    }

    // If no fields to update, return early
    if (queryFragments.length === 0) {
      return res.status(400).json({
        message: "No fields to update. Please provide at least one field.",
      });
    }

    queryFragments.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE user_programmes
      SET ${queryFragments.join(", ")}
      WHERE programme_id = $${index} AND user_id = $${index + 1}
      RETURNING *;
    `;

    queryValues.push(programmeId, userId);

    const { rows: updatedProgramme } = await client.query(query, queryValues);

    if (updatedProgramme.length === 0) {
      return res.status(404).json({ message: "Programme not found." });
    }

    res.status(200).json(updatedProgramme[0]);
  } catch (error) {
    console.error("Error updating user programme:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user programme by programmeId for logged in user
const deleteUserProgrammeById = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Please log in and provide an authorization token." });
  }

  const programmeId = req.params.id;
  try {
    const { rows: deletedProgramme } = await client.query(
      "DELETE FROM user_programmes WHERE programme_id = $1 AND user_id = $2 RETURNING *;",
      [programmeId, userId]
    );
    if (deletedProgramme.length === 0) {
      return res
        .status(404)
        .json({ message: "User has not joined programme of specified id." });
    }
    res.status(200).json({
      message:
        "Programme unsubscribed successfully for user (userId:" + userId + ").",
    });
  } catch (error) {
    console.error("Error deleting user programme:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUserProgrammes,
  getUserProgrammeById,
  getUserProgrammesByUserId,
  addProgrammeToUser,
  updateUserProgrammeById,
  deleteUserProgrammeById,
};
