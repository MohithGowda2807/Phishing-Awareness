const express = require("express");
const User = require("../models/User");
const Submission = require("../models/Submission");
const Mission = require("../models/Mission");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /api/users/me
 * Get logged-in user
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/users/leaderboard
 * Get leaderboard (all users sorted by XP)
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .select("username xp level missionsCompleted correctDecisions totalDecisions tier")
      .sort({ xp: -1 })
      .limit(100);

    const leaderboard = users.map((u, index) => {
      const accuracy =
        u.totalDecisions && u.totalDecisions > 0
          ? Math.round((u.correctDecisions / u.totalDecisions) * 100)
          : 0;

      return {
        rank: index + 1,
        username: u.username,
        level: u.level,
        xp: u.xp,
        tier: u.tier || "bronze",
        missionsCompleted: u.missionsCompleted,
        accuracy
      };
    });

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});

/**
 * GET /api/users/:id/stats
 * Get detailed user statistics
 */
router.get("/:id/stats", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all submissions for this user
    const submissions = await Submission.find({ userId: req.params.id })
      .populate("missionId", "title difficulty isPhishing categories type")
      .sort({ createdAt: -1 });

    // Calculate category breakdown
    const categoryStats = {};
    const difficultyStats = { 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 }, 5: { correct: 0, total: 0 } };
    const typeStats = { phishing: { correct: 0, total: 0 }, legitimate: { correct: 0, total: 0 } };
    const accuracyOverTime = [];
    let runningCorrect = 0;
    let runningTotal = 0;

    submissions.forEach((sub, index) => {
      if (!sub.missionId) return;

      const mission = sub.missionId;
      const isCorrect = sub.verdict === mission.isPhishing;

      // Category stats
      (mission.categories || []).forEach(cat => {
        if (!categoryStats[cat]) {
          categoryStats[cat] = { correct: 0, total: 0 };
        }
        categoryStats[cat].total++;
        if (isCorrect) categoryStats[cat].correct++;
      });

      // Difficulty stats
      const diff = mission.difficulty || 3;
      difficultyStats[diff].total++;
      if (isCorrect) difficultyStats[diff].correct++;

      // Type stats (phishing vs legitimate)
      const missionType = mission.isPhishing ? "phishing" : "legitimate";
      typeStats[missionType].total++;
      if (isCorrect) typeStats[missionType].correct++;

      // Accuracy over time (last 20 missions)
      runningTotal++;
      if (isCorrect) runningCorrect++;

      if (index < 20) {
        accuracyOverTime.push({
          index: index + 1,
          accuracy: Math.round((runningCorrect / runningTotal) * 100),
          date: sub.createdAt
        });
      }
    });

    // Calculate skill breakdown (technical vs social)
    const technicalCategories = ["spoofing", "technical", "headers", "domain"];
    const socialCategories = ["urgency", "authority", "social", "pretexting"];

    let technicalScore = 0, technicalTotal = 0;
    let socialScore = 0, socialTotal = 0;

    Object.entries(categoryStats).forEach(([cat, stats]) => {
      if (technicalCategories.some(tc => cat.toLowerCase().includes(tc))) {
        technicalScore += stats.correct;
        technicalTotal += stats.total;
      }
      if (socialCategories.some(sc => cat.toLowerCase().includes(sc))) {
        socialScore += stats.correct;
        socialTotal += stats.total;
      }
    });

    // Find weaknesses (categories with <60% accuracy and at least 2 attempts)
    const weaknesses = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.total >= 2 && (stats.correct / stats.total) < 0.6)
      .map(([cat, stats]) => ({
        category: cat,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        attempts: stats.total
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    // Calculate reputation score (based on accuracy, missions, badges)
    const reputationScore = Math.min(100, Math.round(
      (user.correctDecisions / Math.max(user.totalDecisions, 1)) * 40 +
      Math.min(user.missionsCompleted, 50) +
      (user.badges?.length || 0) * 2
    ));

    res.json({
      user: {
        username: user.username,
        level: user.level,
        xp: user.xp,
        tier: user.tier,
        streak: user.streak,
        longestStreak: user.longestStreak,
        missionsCompleted: user.missionsCompleted,
        correctDecisions: user.correctDecisions,
        totalDecisions: user.totalDecisions,
        badges: user.badges,
        createdAt: user.createdAt
      },
      stats: {
        overallAccuracy: user.totalDecisions > 0
          ? Math.round((user.correctDecisions / user.totalDecisions) * 100)
          : 0,
        reputationScore,
        skillBreakdown: {
          technical: technicalTotal > 0 ? Math.round((technicalScore / technicalTotal) * 100) : 50,
          social: socialTotal > 0 ? Math.round((socialScore / socialTotal) * 100) : 50
        },
        categoryStats,
        difficultyStats,
        typeStats,
        weaknesses,
        accuracyOverTime: accuracyOverTime.reverse()
      },
      recentSubmissions: submissions.slice(0, 10).map(sub => ({
        id: sub._id,
        missionTitle: sub.missionId?.title || "Unknown Mission",
        score: sub.score,
        correct: sub.missionId ? sub.verdict === sub.missionId.isPhishing : false,
        date: sub.createdAt
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load user stats" });
  }
});

/**
 * GET /api/users/:id/history
 * Get user's submission history
 */
router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ userId: req.params.id })
      .populate("missionId", "title difficulty isPhishing")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ userId: req.params.id });

    res.json({
      submissions: submissions.map(sub => ({
        id: sub._id,
        missionId: sub.missionId?._id,
        missionTitle: sub.missionId?.title || "Unknown",
        difficulty: sub.missionId?.difficulty,
        score: sub.score,
        verdict: sub.verdict,
        correct: sub.missionId ? sub.verdict === sub.missionId.isPhishing : false,
        feedback: sub.feedback,
        date: sub.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load history" });
  }
});

module.exports = router;
