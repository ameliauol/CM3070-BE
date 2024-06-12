const express = require("express");
const app = express();

// Define a port
const PORT = process.env.PORT || 3000;

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const pool = require("./db");

pool.query("SELECT * FROM users", (error, results) => {
  if (error) {
    console.error("Error executing query:", error);
  } else {
    console.log("Query results:", results);
  }
});
