const { client } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  let { username, email, password, name, is_admin } = req.body;
  const adminSecretKey = req.headers["admin-secret-key"];

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    username = username.toLowerCase();
    email = email.toLowerCase();

    const existingUser = await client.query(
      "SELECT id FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].username === username) {
        return res.status(400).json({ error: "Username already exists" });
      } else {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Check admin secret key only if is_admin is explicitly set to true
    if (is_admin === true && adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: "Invalid admin secret key" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use the provided is_admin value, or default to false if not provided
    const newUser = await client.query(
      "INSERT INTO users (username, email, password_hash, name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, hashedPassword, name, is_admin || false]
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
      {
        id: user.rows[0].id,
        username: user.rows[0].username,
        is_admin: user.rows[0].is_admin,
      },
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

/* Allow update OR delete if and only if:
  1. The user is updating their own account OR
  2. The correct admin secret key is provided OR
  3. The user is an admin
*/
exports.updateUserByUsername = async (req, res) => {
  const usernameToUpdate = req.params.currUsername.toLowerCase();
  const currentUser = req.user.username.toLowerCase();
  let { username, email, name, password, is_admin } = req.body;
  const adminSecretKey = req.headers["admin-secret-key"];

  if (
    currentUser !== usernameToUpdate &&
    adminSecretKey !== process.env.ADMIN_SECRET_KEY &&
    !req.user.is_admin
  ) {
    return res.status(403).json({
      error:
        "You are unauthorized to complete this action, you can only update your own account unless you have administrator rights.",
    });
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
      values.push(email.toLowerCase());
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

    // Check admin secret key only if is_admin is explicitly set to true
    if (is_admin === true && adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        error: "Invalid admin secret key, please contact the team.",
      });
    } else if (is_admin === true) {
      // Only update if explicitly setting to true
      fields.push(`is_admin = $${index++}`);
      values.push(is_admin);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(currUsername);

    const updatedUser = await client.query(
      `UPDATE users SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE LOWER(username) = $${index} RETURNING id, username, email, name, is_admin, created_at, updated_at`,
      values
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
      if (error.detail.includes("username")) {
        return res.status(400).json({ error: "Username already exists" });
      } else if (error.detail.includes("email")) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteUserByUsername = async (req, res) => {
  const usernameToDelete = req.params.username.toLowerCase();
  const currentUser = req.user.username.toLowerCase();
  const adminSecretKey = req.headers["admin-secret-key"];

  try {
    if (
      currentUser !== usernameToUpdate &&
      adminSecretKey !== process.env.ADMIN_SECRET_KEY &&
      !req.user.is_admin
    ) {
      return res.status(403).json({
        error:
          "You are unauthorized to complete this action, you can only update your own account unless you have administrator rights.",
      });
    } else {
      const deletedUser = await client.query(
        "DELETE FROM users WHERE LOWER(username) = $1 RETURNING id, username",
        [usernameToDelete]
      );

      if (deletedUser.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User deleted successfully",
        deletedUserId: deletedUser.rows[0].id,
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
