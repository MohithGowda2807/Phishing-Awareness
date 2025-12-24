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

    // Role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
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
    // Same day, no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    this.streak += 1;
    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak;
    }
  } else {
    // Streak broken
    this.streak = 1;
  }

  this.lastActiveDate = today;
};

module.exports = mongoose.model("User", userSchema);
