const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    // Role
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user"
    },

    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      default: "bronze"
    },

    // Streak System
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },

    // Stats
    missionsCompleted: { type: Number, default: 0 },
    correctDecisions: { type: Number, default: 0 },
    totalDecisions: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 },

    // Badges
    badges: {
      type: [String],
      default: []
    },

    // Behavioral Profiling
    behaviorProfile: {
      // Decision style classification
      style: {
        type: String,
        enum: ["cautious", "balanced", "risk-taker", "unknown"],
        default: "unknown"
      },

      // Average time to make a decision (in seconds)
      avgDecisionTime: { type: Number, default: 0 },
      totalDecisionTime: { type: Number, default: 0 },

      // Tool usage rate (0-100%)
      toolUsageRate: { type: Number, default: 0 },
      totalToolsUsed: { type: Number, default: 0 },
      totalToolsAvailable: { type: Number, default: 0 },

      // Confidence patterns
      avgConfidence: { type: Number, default: 50 },
      overconfidentMistakes: { type: Number, default: 0 },

      // Category weaknesses
      weakCategories: [String],
      strongCategories: [String],

      // Decision tendencies
      reportRate: { type: Number, default: 0 },  // % of times user reports
      clickRate: { type: Number, default: 0 },   // % of times user clicks links

      // Risk assessment
      riskScore: { type: Number, default: 50 }  // 0=very cautious, 100=very risky
    },

    // Community stats
    communityStats: {
      challengesCreated: { type: Number, default: 0 },
      challengesPlayed: { type: Number, default: 0 },
      totalUpvotesReceived: { type: Number, default: 0 },
      reputationScore: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Calculate tier based on level
userSchema.methods.calculateTier = function () {
  if (this.level >= 50) return "diamond";
  if (this.level >= 30) return "platinum";
  if (this.level >= 20) return "gold";
  if (this.level >= 10) return "silver";
  return "bronze";
};

// Update streak
userSchema.methods.updateStreak = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!this.lastActiveDate) {
    this.streak = 1;
    this.lastActiveDate = today;
    return;
  }

  const lastActive = new Date(this.lastActiveDate);
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const diffDays = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return;
  } else if (diffDays === 1) {
    this.streak += 1;
    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak;
    }
  } else {
    this.streak = 1;
  }

  this.lastActiveDate = today;
};

// Update behavioral profile
userSchema.methods.updateBehaviorProfile = function (decisionData) {
  const {
    decisionTime,
    toolsUsed,
    toolsAvailable,
    confidence,
    wasCorrect,
    decision,
    category
  } = decisionData;

  const bp = this.behaviorProfile;

  // Update decision time average
  bp.totalDecisionTime += decisionTime;
  bp.avgDecisionTime = bp.totalDecisionTime / this.totalDecisions;

  // Update tool usage
  bp.totalToolsUsed += toolsUsed;
  bp.totalToolsAvailable += toolsAvailable;
  bp.toolUsageRate = Math.round((bp.totalToolsUsed / bp.totalToolsAvailable) * 100);

  // Update confidence
  bp.avgConfidence = Math.round((bp.avgConfidence * (this.totalDecisions - 1) + confidence) / this.totalDecisions);

  // Track overconfident mistakes
  if (!wasCorrect && confidence > 75) {
    bp.overconfidentMistakes++;
  }

  // Update decision tendencies
  if (decision === "report") {
    bp.reportRate = ((bp.reportRate * (this.totalDecisions - 1)) + 100) / this.totalDecisions;
  } else {
    bp.reportRate = (bp.reportRate * (this.totalDecisions - 1)) / this.totalDecisions;
  }

  if (decision === "click") {
    bp.clickRate = ((bp.clickRate * (this.totalDecisions - 1)) + 100) / this.totalDecisions;
  } else {
    bp.clickRate = (bp.clickRate * (this.totalDecisions - 1)) / this.totalDecisions;
  }

  // Calculate risk score
  bp.riskScore = Math.round(
    (100 - bp.toolUsageRate) * 0.3 +
    (bp.avgConfidence) * 0.3 +
    (bp.clickRate) * 0.2 +
    (180 - Math.min(bp.avgDecisionTime, 180)) / 180 * 100 * 0.2
  );

  // Classify behavior style
  if (bp.riskScore >= 70) {
    bp.style = "risk-taker";
  } else if (bp.riskScore <= 30) {
    bp.style = "cautious";
  } else {
    bp.style = "balanced";
  }
};

module.exports = mongoose.model("User", userSchema);
