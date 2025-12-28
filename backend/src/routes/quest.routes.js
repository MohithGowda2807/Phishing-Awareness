const express = require("express");
const router = express.Router();
const {
    getRegions,
    getRegionById,
    getQuestById,
    completeQuest,
    getUserProgress,
    createRegion,
    createQuest,
    seedRegions
} = require("../controllers/quest.controller");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// Public routes (progress added if authenticated)
router.get("/regions", authenticate, getRegions);
router.get("/regions/:id", authenticate, getRegionById);
router.get("/quests/:id", authenticate, getQuestById);

// Authenticated routes
router.get("/progress", authenticate, getUserProgress);
router.post("/quests/:id/complete", authenticate, completeQuest);

// Admin routes
router.post("/regions", authenticate, requireAdmin, createRegion);
router.post("/quests", authenticate, requireAdmin, createQuest);
router.post("/seed", authenticate, requireAdmin, seedRegions);

module.exports = router;
