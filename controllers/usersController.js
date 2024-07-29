const { client } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  let { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    username = username.toLowerCase();

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

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

exports.loginUser = async (req, res) => {
  let { username, password } = req.body;

  try {
    username = username.toLowerCase();

    const user = await client.query(
      "SELECT * FROM users WHERE LOWER(username) = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

exports.getUserByUsername = async (req, res) => {
  const username = req.params.username.toLowerCase();

  if (req.user.username.toLowerCase() !== username) {
    return res
      .status(403)
      .json({ error: "You can only fetch your own account" });
  }

  try {
    const user = await client.query(
      "SELECT id, username, email, name, created_at, updated_at FROM users WHERE LOWER(username) = $1",
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

exports.updateUserByUsername = async (req, res) => {
  const currUsername = req.params.currUsername.toLowerCase();
  let { username, email, name, password } = req.body;

  if (req.user.username.toLowerCase() !== currUsername) {
    return res
      .status(403)
      .json({ error: "You can only update your own account" });
  }

  try {
    const fields = [];
    const values = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username.toLowerCase());
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
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      fields.push(`password_hash = $${index++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(currUsername);

    const updatedUser = await client.query(
      `UPDATE users SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE LOWER(username) = $${index} RETURNING id, username, email, name, created_at, updated_at`,
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

exports.deleteUserByUsername = async (req, res) => {
  const username = req.params.username.toLowerCase();

  if (req.user.username.toLowerCase() !== username) {
    return res
      .status(403)
      .json({ error: "You can only delete your own account" });
  }

  try {
    const deletedUser = await client.query(
      "DELETE FROM users WHERE LOWER(username) = $1 RETURNING username",
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
