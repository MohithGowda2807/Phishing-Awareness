const mongoose = require("mongoose");

/**
 * UserProgress Model
 * 
 * Tracks a user's progress through regions and quests.
 * Separate from User model to keep user data clean.
 */
const userProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Region-level progress
        regionProgress: [{
            regionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Region"
            },
            regionCode: String,  // Denormalized for quick access
            isUnlocked: {
                type: Boolean,
                default: false
            },
            totalStars: {
                type: Number,
                default: 0
            },
            questsCompleted: {
                type: Number,
                default: 0
            },
            totalQuests: {
                type: Number,
                default: 0
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            completedAt: Date,
            firstEnteredAt: Date
        }],

        // Quest-level progress
        questProgress: [{
            questId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Quest"
            },
            regionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Region"
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            stars: {
                type: Number,
                min: 0,
                max: 3,
                default: 0
            },
            bestScore: {
                type: Number,
                default: 0
            },
            attempts: {
                type: Number,
                default: 0
            },
            completedAt: Date,
            lastAttemptAt: Date
        }],

        // Current state
        activeRegion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region"
        },
        lastActiveQuest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quest"
        },

        // Overall stats
        totalStars: {
            type: Number,
            default: 0
        },
        regionsCompleted: {
            type: Number,
            default: 0
        },
        questsCompleted: {
            type: Number,
            default: 0
        },
        totalWorldMapXP: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Index for efficient user lookups
userProgressSchema.index({ userId: 1 });

// Helper method to get or create region progress
userProgressSchema.methods.getRegionProgress = function (regionId) {
    let progress = this.regionProgress.find(
        rp => rp.regionId.toString() === regionId.toString()
    );

    if (!progress) {
        this.regionProgress.push({
            regionId,
            isUnlocked: false,
            totalStars: 0,
            questsCompleted: 0
        });
        progress = this.regionProgress[this.regionProgress.length - 1];
    }

    return progress;
};

// Helper method to get or create quest progress
userProgressSchema.methods.getQuestProgress = function (questId, regionId) {
    let progress = this.questProgress.find(
        qp => qp.questId.toString() === questId.toString()
    );

    if (!progress) {
        this.questProgress.push({
            questId,
            regionId,
            isCompleted: false,
            stars: 0,
            bestScore: 0,
            attempts: 0
        });
        progress = this.questProgress[this.questProgress.length - 1];
    }

    return progress;
};

// Helper to calculate stars from score
userProgressSchema.statics.calculateStars = function (score, thresholds) {
    if (score >= thresholds.three) return 3;
    if (score >= thresholds.two) return 2;
    if (score >= thresholds.one) return 1;
    return 0;
};

module.exports = mongoose.model("UserProgress", userProgressSchema);
