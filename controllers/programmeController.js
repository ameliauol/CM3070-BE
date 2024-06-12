const pool = require("../database/db");

// Get all available programmes
exports.getAllProgrammes = async (req, res) => {
  try {
    const programmes = await pool.query("SELECT * FROM available_programmes");
    res.json(programmes.rows);
  } catch (error) {
    console.error("Error fetching available programmes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get programme details by ID
exports.getProgrammeById = async (req, res) => {
  const programmeId = req.params.id;

  try {
    const programme = await pool.query(
      "SELECT * FROM available_programmes WHERE id = $1",
      [programmeId]
    );
    if (programme.rows.length === 0) {
      return res.status(404).json({ error: "Programme not found" });
    }
    res.json(programme.rows[0]);
  } catch (error) {
    console.error("Error fetching programme details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new programme
exports.createProgramme = async (req, res) => {
  const { name, description } = req.body;
  const createdByUserId = req.user.id;

  try {
    const newProgramme = await pool.query(
      "INSERT INTO available_programmes (name, description, created_by_user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, description, createdByUserId]
    );

    res.status(201).json(newProgramme.rows[0]);
  } catch (error) {
    console.error("Error creating programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
