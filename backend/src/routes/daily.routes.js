const express = require("express");
const router = express.Router();
const {
    getTodayChallenge,
    completeDaily,
    getDailyHistory
} = require("../controllers/daily.controller");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get today's daily challenge
router.get("/today", getTodayChallenge);

// Complete today's challenge
router.post("/complete", completeDaily);

// Get last 7 days history
router.get("/history", getDailyHistory);

module.exports = router;
