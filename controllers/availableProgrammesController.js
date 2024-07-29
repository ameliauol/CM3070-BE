const { client } = require("../db");

exports.getAllAvailableProgrammes = async (req, res) => {
  try {
    const programmes = await client.query(
      `
      SELECT ap.*, u.username AS author_username
      FROM available_programmes ap
      LEFT JOIN users u ON ap.author_id = u.id
      `
    );
    res.json(programmes.rows);
  } catch (error) {
    console.error("Error fetching available programmes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new programme and return with the author's username
exports.createProgramme = async (req, res) => {
  const userId = req.user.id;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  try {
    // Insert the new programme
    await client.query(
      "INSERT INTO available_programmes (name, description, author_id) VALUES ($1, $2, $3)",
      [name, description, userId]
    );

    // Fetch the newly created programme including the author's username
    const newProgramme = await client.query(
      `
      SELECT ap.*, u.username AS author_username
      FROM available_programmes ap
      LEFT JOIN users u ON ap.author_id = u.id
      WHERE ap.name = $1 AND ap.description = $2 AND ap.author_id = $3
      `,
      [name, description, userId]
    );

    res.status(201).json(newProgramme.rows[0]);
  } catch (error) {
    console.error("Error creating programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
