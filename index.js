const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const exerciseRecordRoutes = require("./routes/exerciseRecordRoutes");

// Mounting routes into app
app.use("/auth", authRoutes);
app.use("/exercise/records", exerciseRecordRoutes);

// Check that server has been started
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
