const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const { client, connectClient } = require("./db");

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const exerciseRecordRoutes = require("./routes/exerciseRecordRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const programmeRoutes = require("./routes/programmeRoutes");
const userProgrammeRoutes = require("./routes/userProgrammeRoutes");
const userCalendarRoutes = require("./routes/userCalendarRoutes");

// Mounting routes into app
app.use("/auth", authRoutes);
app.use("/exercise", [exerciseRecordRoutes, exerciseRoutes]);
app.use("/programmes", programmeRoutes);
app.use("/user/programmes", userProgrammeRoutes);
app.use("/user/calendar", userCalendarRoutes);

// Connect to the database and start the server
(async () => {
  try {
    await connectClient();

    // Run a simple test query to verify connection
    const res = await client.query("SELECT NOW()");
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
