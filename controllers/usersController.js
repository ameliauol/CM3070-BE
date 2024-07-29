const { client } = require("../db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    res.status(400).json({ error: "All fields are required" });
  }

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

// Get user by username
exports.getUserByUsername = async (req, res) => {
  const username = req.params.username;

  // Verify that the username in the token matches the username in the request
  if (req.user.username !== username) {
    return res
      .status(403)
      .json({ error: "You can only fetch your own account" });
  }

  try {
    const user = await client.query(
      "SELECT id, username, email, name, created_at, updated_at FROM users WHERE username = $1",
      [username]
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

// Update user by current username
exports.updateUserByUsername = async (req, res) => {
  const currUsername = req.params.currUsername;
  const { username, email, name, password } = req.body;

  // Verify that the current user's username in the token matches the username in the request
  if (req.user.username !== currUsername) {
    return res
      .status(403)
      .json({ error: "You can only update your own account" });
  }

  try {
    // Prepare the fields to be updated
    const fields = [];
    const values = [];
    let index = 1; // Parameter index for SQL query

    // Add fields dynamically based on the request body
    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    if (password) {
      // Hash the new password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      fields.push(`password_hash = $${index++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add the current username as the last parameter for the WHERE clause
    values.push(currUsername);

    // Update the user in the database
    const updatedUser = await client.query(
      `UPDATE users SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE username = $${index} RETURNING id, username, email, name, created_at, updated_at`,
      values
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

// Delete user by username
exports.deleteUserByUsername = async (req, res) => {
  const username = req.params.username;

  // Verify that the user ID in the token matches the ID in the request
  if (req.user.username !== username) {
    return res
      .status(403)
      .json({ error: "You can only delete your own account" });
  }

  try {
    const deletedUser = await client.query(
      "DELETE FROM users WHERE username = $1 RETURNING username",
      [username]
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
