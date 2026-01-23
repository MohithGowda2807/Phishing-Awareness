const express = require("express");
const router = express.Router();
const {
    getAllAchievements,
    getUserAchievements,
    toggleShowcase,
    markViewed,
    getRecentUnlocks
} = require("../controllers/achievement.controller");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get all achievements with user progress
router.get("/", getAllAchievements);

// Get user's unlocked achievements
router.get("/user/:userId?", getUserAchievements);

// Get recently unlocked (unviewed) achievements
router.get("/recent", getRecentUnlocks);

// Toggle showcase status
router.put("/:achievementId/showcase", toggleShowcase);

// Mark achievement as viewed
router.put("/:achievementId/viewed", markViewed);

module.exports = router;
