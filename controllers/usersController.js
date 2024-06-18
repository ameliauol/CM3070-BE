const { client } = require("../db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password, name } = req.body;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const newUser = await client.query(
      "INSERT INTO users (username, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, name]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to login a user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await client.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Adjust token expiration as needed
    );

    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await client.query(
      "SELECT id, username, email, name, created_at, updated_at FROM users"
    );
    res.json(users.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await client.query(
      "SELECT id, username, email, name, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update user by ID
exports.updateUserById = async (req, res) => {
  const userId = req.params.id;
  const { username, email, name } = req.body;

  // Verify that the user ID in the token matches the ID in the request
  if (req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: "You can only update your own account" });
  }

  try {
    const updatedUser = await client.query(
      "UPDATE users SET username = $1, email = $2, name = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, email, name, created_at, updated_at",
      [username, email, name, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  const userId = req.params.id;

  // Verify that the user ID in the token matches the ID in the request
  if (req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: "You can only delete your own account" });
  }

  try {
    const deletedUser = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (deletedUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUserId: deletedUser.rows[0].id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
