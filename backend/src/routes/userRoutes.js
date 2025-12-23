const express = require("express");
const User = require("../models/User");
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


router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .select("username xp level missionsCompleted correctDecisions totalDecisions")
      .sort({ xp: -1 });

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
        accuracy
      };
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});


/**
 * GET /api/users/leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(20)
      .select("name xp level accuracy");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
