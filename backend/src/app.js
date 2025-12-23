const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Phishing Training API running" });
});
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

const missionRoutes = require("./routes/mission.routes");

app.use("/api/missions", missionRoutes);

const submissionRoutes = require("./routes/submission.routes");

app.use("/api/submit", submissionRoutes);


module.exports = app;
