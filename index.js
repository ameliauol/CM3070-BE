const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const { client, connectClient } = require("./db");

// Middleware
app.use(express.json());

// Import routes
const usersRoutes = require("./routes/usersRoutes");
const availableProgrammesRoutes = require("./routes/availableProgrammesRoutes");
const exercisesRoutes = require("./routes/exercisesRoutes");
const exerciseInstructionsRoutes = require("./routes/exerciseInstructionsRoutes");
const programmeExercisesRoutes = require("./routes/programmeExercisesRoutes");
const userProgrammesRoutes = require("./routes/userProgrammesRoutes");
const userExercisesRoutes = require("./routes/userExercisesRoutes");
const exercisesRecordsRoutes = require("./routes/exercisesRecordsRoutes");
const userCalendarRoutes = require("./routes/userCalendarRoutes");

// Use routes
app.use("/api", usersRoutes);
app.use("/api", availableProgrammesRoutes);
app.use("/api", exercisesRoutes);
app.use("/api", exerciseInstructionsRoutes);
app.use("/api", programmeExercisesRoutes);
app.use("/api", userProgrammesRoutes);
app.use("/api", userExercisesRoutes);
app.use("/api", exercisesRecordsRoutes);
app.use("/api", userCalendarRoutes);

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
