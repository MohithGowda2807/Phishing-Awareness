const express = require("express");
const cors = require("cors");

const app = express();

// CORS Configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Phishing Training API running" });
});

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const missionRoutes = require("./routes/mission.routes");
app.use("/api/missions", missionRoutes);

const submissionRoutes = require("./routes/submission.routes");
app.use("/api/submit", submissionRoutes);

const challengeRoutes = require("./routes/challenge.routes");
app.use("/api/challenges", challengeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

module.exports = app;
