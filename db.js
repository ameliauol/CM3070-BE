const { Client } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

// Function to connect the client
async function connectClient() {
  try {
    await client.connect();
    console.log("Database connection successful!");
  } catch (err) {
    console.error("Database connection error:", err);
    throw err; // Rethrow the error to handle it in the server start logic
  }
}

module.exports = {
  client,
  connectClient,
};
