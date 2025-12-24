const Mission = require("../models/Mission");
const Submission = require("../models/Submission");
const User = require("../models/User");
const {
  calculateXP,
  calculateLevel,
  calculateTier,
  assignBadges
} = require("../utils/gamification");

// SUBMIT MISSION RESPONSE
exports.submitMission = async (req, res) => {
  try {
    const { userId, missionId, verdict, selectedClues } = req.body;

    // Validate input
    if (!userId || !missionId) {
      return res.status(400).json({ message: "Missing userId or missionId" });
    }

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ userId, missionId });
    if (existingSubmission) {
      return res.status(400).json({ message: "Already submitted this mission" });
    }

    // Verdict correctness
    const verdictCorrect = verdict === mission.isPhishing;

    // Clue matching
    const correctClues = mission.clues || [];
    const matchedClues = (selectedClues || []).filter(clue =>
      correctClues.includes(clue)
    );

    // Scoring formula
    const basePoints = mission.scoreWeight || 50;
    const difficultyMultiplier = mission.difficulty * 0.5;
    const clueScore = correctClues.length > 0
      ? matchedClues.length / correctClues.length
      : 1;

    let score = basePoints * difficultyMultiplier * (verdictCorrect ? 1 : 0.5) * clueScore;
    score = Math.round(Math.min(Math.max(score, 0), 100));

    // Feedback generation
    let feedback = "";
    if (verdictCorrect) {
      feedback += "✅ Correct verdict. ";
    } else {
      feedback += "❌ Incorrect verdict. ";
    }

    if (matchedClues.length > 0) {
      feedback += `You identified: ${matchedClues.join(", ")}. `;
    }

    const missedClues = correctClues.filter(clue => !matchedClues.includes(clue));
    if (missedClues.length > 0) {
      feedback += `You missed: ${missedClues.join(", ")}.`;
    }

    // Update streak
    user.updateStreak();

    // Calculate XP with streak bonus
    const xpGained = calculateXP(score, mission.difficulty, user.streak);
    const newXP = user.xp + xpGained;
    const newLevel = calculateLevel(newXP);
    const newTier = calculateTier(newLevel);

    // Assign badges
    const newBadges = assignBadges({
      score,
      verdictCorrect,
      matchedClues,
      user,
      streak: user.streak
    });

    // Update user
    user.xp = newXP;
    user.level = newLevel;
    user.tier = newTier;
    user.weeklyXP += xpGained;
    user.missionsCompleted += 1;
    user.totalDecisions += 1;
    if (verdictCorrect) {
      user.correctDecisions += 1;
    }
    user.badges.push(...newBadges);

    await user.save();

    // Save submission
    const submission = await Submission.create({
      userId,
      missionId,
      verdict,
      selectedClues: selectedClues || [],
      score,
      feedback
    });

    res.status(201).json({
      score,
      xpGained,
      level: user.level,
      tier: user.tier,
      streak: user.streak,
      newBadges,
      feedback,
      submissionId: submission._id
    });

  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET USER STATS
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const submissions = await Submission.find({ userId }).populate("missionId", "title difficulty");

    const accuracy = user.totalDecisions > 0
      ? Math.round((user.correctDecisions / user.totalDecisions) * 100)
      : 0;

    res.json({
      user: {
        username: user.username,
        level: user.level,
        xp: user.xp,
        tier: user.tier,
        streak: user.streak,
        longestStreak: user.longestStreak,
        missionsCompleted: user.missionsCompleted,
        accuracy,
        badges: user.badges
      },
      recentSubmissions: submissions.slice(-10).reverse()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
