const { client } = require("../db");

// Get all available programmes
exports.getAllAvailableProgrammes = async (req, res) => {
  try {
    const programmes = await client.query("SELECT * FROM available_programmes");
    res.json(programmes.rows);
  } catch (error) {
    console.error("Error fetching available programmes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new programme
exports.createProgramme = async (req, res) => {
  const { name, description, created_by_user_id } = req.body;
  try {
    const newProgramme = await client.query(
      "INSERT INTO available_programmes (name, description, created_by_user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, description, created_by_user_id]
    );
    res.status(201).json(newProgramme.rows[0]);
  } catch (error) {
    console.error("Error creating programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
