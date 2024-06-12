const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

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
app.use("/exercise/records", exerciseRecordRoutes);
app.use("/exercise", exerciseRoutes);
app.use("/programmes", programmeRoutes);
app.use("/user/programmes", userProgrammeRoutes);
app.use("/user/calendar", userCalendarRoutes);

// Check that server has been started
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
