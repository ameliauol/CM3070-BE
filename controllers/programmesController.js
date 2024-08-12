const { client } = require("../setup/db");

exports.getAllProgrammes = async (req, res) => {
  try {
    const programmes = await client.query(
      `
      SELECT p.*, u.username AS author_username
      FROM programmes p
      LEFT JOIN users u ON p.author_id = u.id
      `
    );
    res.json(programmes.rows);
  } catch (error) {
    console.error("Error fetching programmes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProgrammeById = async (req, res) => {
  try {
    const programmeId = req.params.id;
    const programme = await client.query(
      `
      SELECT p.*, u.username AS author_username
      FROM programmes p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
      `,
      [programmeId]
    );

    if (programme.rows.length === 0) {
      return res.status(404).json({ error: "Programme not found" });
    }

    res.json(programme.rows[0]);
  } catch (error) {
    console.error("Error fetching programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createProgramme = async (req, res) => {
  const userId = req.user.id;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  try {
    // Use RETURNING and explicit LEFT JOIN
    const createdProgramme = await client.query(
      `
      INSERT INTO programme (name, description, author_id)
      VALUES ($1, $2, $3)
      RETURNING p.*, u.username AS author_username
      FROM programmes p
      LEFT JOIN users u ON p.author_id = u.id
      `,
      [name, description, userId]
    );

    res.status(201).json(createdProgramme.rows[0]);
  } catch (error) {
    console.error("Error creating programme:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
