const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createChallenge,
    getChallenges,
    getChallengeById,
    voteChallenge,
    getMyChallenges,
    submitChallengeAnswer,
    getPendingChallenges,
    moderateChallenge
} = require("../controllers/challenge.controller");

// Public routes (still require auth)
router.get("/", authMiddleware, getChallenges);
router.get("/my", authMiddleware, getMyChallenges);
router.get("/pending", authMiddleware, getPendingChallenges);
router.get("/:id", authMiddleware, getChallengeById);

// Protected routes
router.post("/", authMiddleware, createChallenge);
router.post("/:id/vote", authMiddleware, voteChallenge);
router.post("/:id/submit", authMiddleware, submitChallengeAnswer);
router.post("/:id/moderate", authMiddleware, moderateChallenge);

module.exports = router;
