const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const { client, connectClient } = require("./setup/db");

const allowedOrigins = [
  "http://localhost:5173", // Vite local development URL
  "https://strengthmatrix.netlify.app/", // Production frontend URL
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies) if needed
    allowedHeaders: ["Content-Type", "Authorization"], // Allow the Authorization header
  })
);
app.use(express.json());

// Import routes
const usersRoutes = require("./routes/usersRoutes");
const programmesRoutes = require("./routes/programmesRoutes");
const exercisesRoutes = require("./routes/exercisesRoutes");
const exerciseInstructionsRoutes = require("./routes/exerciseInstructionsRoutes");
const programmeExercisesRoutes = require("./routes/programmeExercisesRoutes");
const userProgrammesRoutes = require("./routes/userProgrammesRoutes");
const userExercisesRoutes = require("./routes/userExercisesRoutes");
const exercisesRecordsRoutes = require("./routes/exercisesRecordsRoutes");

// Use routes
app.use("/users", usersRoutes);
app.use("/exercise/instructions", exerciseInstructionsRoutes);
app.use("/exercises/records", exercisesRecordsRoutes);
app.use("/exercises", exercisesRoutes);
app.use("/programme/exercises", programmeExercisesRoutes);
app.use("/user/programmes", userProgrammesRoutes);
app.use("/user/exercises", userExercisesRoutes);
app.use("/programmes", programmesRoutes);

// Connect to the database and start the server
(async () => {
  try {
    await connectClient();

    // Run a simple test query to verify connection
    const res = await client.query(`SELECT NOW() as now`);
    console.log("Current Time from DB:", res.rows[0].now);

    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit the process with an error code
  }
})();
