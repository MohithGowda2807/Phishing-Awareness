const mongoose = require("mongoose");

/**
 * User Achievement Model
 * 
 * Tracks which achievements each user has unlocked
 */
const userAchievementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        achievement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Achievement",
            required: true
        },

        // When unlocked
        unlockedAt: {
            type: Date,
            default: Date.now
        },

        // Progress towards achievement (for multi-step achievements)
        progress: {
            current: {
                type: Number,
                default: 0
            },
            target: {
                type: Number,
                default: 1
            }
        },

        // Has user seen the unlock notification?
        isViewed: {
            type: Boolean,
            default: false
        },

        // Is this achievement showcased on profile?
        isShowcased: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Compound index: one achievement per user
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, isShowcased: 1 });

module.exports = mongoose.model("UserAchievement", userAchievementSchema);
