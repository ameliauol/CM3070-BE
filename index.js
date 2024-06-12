const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");

// Mounting routes into app
app.use("/auth", authRoutes);

// Check that server has been started
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
