const mongoose = require("mongoose");

/**
 * Daily Challenge Model
 * 
 * Rotates daily to provide fresh challenges for users
 */
const dailyChallengeSchema = new mongoose.Schema(
    {
        // Date this challenge is active (YYYY-MM-DD format)
        date: {
            type: String,
            required: true,
            unique: true
        },

        // Difficulty tier
        difficulty: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        },

        // Linked content
        contentType: {
            type: String,
            enum: ["mission", "question", "quest"],
            required: true
        },

        // Reference to actual content
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "contentType"
        },

        // Bonus rewards
        bonusXP: {
            type: Number,
            default: 100
        },

        bonusMultiplier: {
            type: Number,
            default: 2.0  // 2x XP for daily challenges
        },

        // Title and description
        title: {
            type: String,
            required: true
        },
        description: String,

        // Completion tracking (embedded)
        completions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            completedAt: {
                type: Date,
                default: Date.now
            },
            score: Number,
            timeSpent: Number  // seconds
        }],

        // Stats
        totalAttempts: {
            type: Number,
            default: 0
        },
        totalCompletions: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Indexes
dailyChallengeSchema.index({ date: 1 });
dailyChallengeSchema.index({ "completions.user": 1 });

module.exports = mongoose.model("DailyChallenge", dailyChallengeSchema);
