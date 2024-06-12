const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const authenticateToken = require("../middleware/authenticateToken");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at, updated_at",
      [username, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (
      user.rows.length === 0 ||
      !(await bcrypt.compare(password, user.rows[0].password_hash))
    ) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const userProfile = await pool.query(
      "SELECT id, username, email, name, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    res.json(userProfile.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    const updatedUser = await pool.query(
      "UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, email, created_at, updated_at",
      [name, email, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  registerUser: registerUser,
  loginUser: loginUser,
  getUserProfile: authenticateToken(getUserProfile),
  updateUserProfile: authenticateToken(updateUserProfile),
};
