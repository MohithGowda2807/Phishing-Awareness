const express = require("express");
const router = express.Router();
const riskScoreController = require("../controllers/riskScore.controller");
const auth = require("../middleware/auth");

// Public verification endpoint (no auth required)
router.get("/verify/:token", riskScoreController.verifyScore);

// Track view (no auth required)
router.post("/view/:token", riskScoreController.trackScoreView);

// Public leaderboard
router.get("/leaderboard", riskScoreController.getScoreLeaderboard);

// Protected routes
router.use(auth);

// Generate new score
router.post("/generate", riskScoreController.generateScore);

// Get latest score
router.get("/latest", riskScoreController.getLatestScore);

// Get score history
router.get("/history", riskScoreController.getScoreHistory);

module.exports = router;
