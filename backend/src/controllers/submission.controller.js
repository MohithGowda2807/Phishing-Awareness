const Mission = require("../models/Mission");
const Submission = require("../models/Submission");
const User = require("../models/User");
const {
  calculateXP,
  calculateLevel,
  assignBadges
} = require("../utils/gamification");


// SUBMIT MISSION RESPONSE
exports.submitMission = async (req, res) => {
  try {
    const { userId, missionId, verdict, selectedClues } = req.body;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    // ✅ Verdict correctness
    const verdictCorrect = verdict === mission.isPhishing;

    // ✅ Clue matching
    const correctClues = mission.clues;
    const matchedClues = selectedClues.filter(clue =>
      correctClues.includes(clue)
    );

    // ✅ Scoring formula (from your doc)
    const basePoints = mission.scoreWeight;
    const difficultyMultiplier = mission.difficulty * 0.5;
    const clueScore =
      matchedClues.length / correctClues.length;

    let score =
      basePoints *
      difficultyMultiplier *
      (verdictCorrect ? 1 : 0.5) *
      clueScore;

    score = Math.round(score);

    // ✅ Feedback generation (template-based)
    let feedback = "";

    if (verdictCorrect) {
      feedback += "Correct verdict. ";
    } else {
      feedback += "Incorrect verdict. ";
    }

    if (matchedClues.length > 0) {
      feedback += `You identified: ${matchedClues.join(", ")}. `;
    }

    const missedClues = correctClues.filter(
      clue => !matchedClues.includes(clue)
    );

    if (missedClues.length > 0) {
      feedback += `You missed: ${missedClues.join(", ")}.`;
    }

    // ✅ Save submission
    const user = await User.findById(userId);

const xpGained = calculateXP(score, mission.difficulty);
const newXP = user.xp + xpGained;
const newLevel = calculateLevel(newXP);

const newBadges = assignBadges({
  score,
  verdictCorrect,
  matchedClues,
  user
});

// Update user
user.xp = newXP;
user.level = newLevel;
user.missionsCompleted += 1;
user.badges.push(...newBadges);

await user.save();

// Save submission
const submission = await Submission.create({
  userId,
  missionId,
  verdict,
  selectedClues,
  score,
  feedback
});


    res.status(201).json({
  score,
  xpGained,
  level: user.level,
  newBadges,
  feedback,
  submissionId: submission._id
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
