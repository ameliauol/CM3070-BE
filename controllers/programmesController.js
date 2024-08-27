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
    res
      .status(500)
      .json({ error: "Internal Server Error", error_code: "SERVER_ERROR" });
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
      return res.status(404).json({
        error: "Programme not found",
        error_code: "PROGRAMME_NOT_FOUND",
      });
    }

    res.json(programme.rows[0]);
  } catch (error) {
    console.error("Error fetching programme:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", error_code: "SERVER_ERROR" });
  }
};

exports.createProgramme = async (req, res) => {
  const userId = req.user.id;
  let { name, description, difficulty_level, est_duration, image_url } =
    req.body;

  // Check for required fields
  if (
    !name ||
    !description ||
    name.trim() === "" ||
    description.trim() === "" ||
    !difficulty_level ||
    difficulty_level.trim() === "" ||
    !est_duration ||
    est_duration.trim() === "" ||
    !image_url ||
    image_url.trim() === ""
  ) {
    return res.status(400).json({
      error:
        "Name, description, difficulty level, estimated duration and image_url are required",
      error_code: "MISSING_REQUIRED_FIELDS",
    });
  }

  // Normalize and capitalize the difficulty level
  difficulty_level = difficulty_level.toLowerCase();
  const validLevels = ["beginner", "intermediate", "advanced"];
  if (!validLevels.includes(difficulty_level)) {
    return res.status(400).json({
      error:
        "Invalid difficulty level, please enter 'beginner', 'intermediate', or 'advanced'.",
      error_code: "INVALID_DIFFICULTY_LEVEL",
    });
  }
  difficulty_level =
    difficulty_level.charAt(0).toUpperCase() + difficulty_level.slice(1);

  // Validate estimated duration
  const parsedEstDuration = parseInt(est_duration, 10);
  if (
    isNaN(parsedEstDuration) ||
    parsedEstDuration <= 0 ||
    parsedEstDuration >= 300
  ) {
    return res.status(400).json({
      error: "Estimated duration must be between 0 and 300 minutes",
      error_code: "INVALID_EST_DURATION",
    });
  }

  try {
    const createdProgramme = await client.query(
      `
      WITH new_programme AS (
        INSERT INTO programmes (name, description, difficulty_level, est_duration, iamge_url, author_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      )
      SELECT new_programme.*, users.username AS author_username
      FROM new_programme
      LEFT JOIN users ON new_programme.author_id = users.id;
      `,
      [
        name,
        description,
        difficulty_level,
        parsedEstDuration,
        image_url,
        userId,
      ]
    );

    res.status(201).json(createdProgramme.rows[0]);
  } catch (error) {
    console.error("Error creating programme:", error);
    res.status(500).json({
      error: "Internal Server Error",
      error_code: "SERVER_ERROR",
    });
  }
};
