const mongoose = require("mongoose");

/**
 * Quest Model
 * 
 * Represents a level/mission within a region.
 * Quests can link to existing Missions, Questions, or Challenges.
 */
const questSchema = new mongoose.Schema(
    {
        // Parent region
        region: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region",
            required: true
        },

        // Basic info
        title: {
            type: String,
            required: true
        },
        description: String,

        // Position within region (1, 2, 3...)
        order: {
            type: Number,
            required: true
        },

        // Quest type determines what content is loaded
        questType: {
            type: String,
            enum: ["mission", "question", "challenge", "boss", "tutorial"],
            default: "mission"
        },

        // Link to actual content (only one should be set based on questType)
        linkedContent: {
            missionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Mission"
            },
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            },
            challengeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Challenge"
            }
        },

        // Difficulty (1-5 stars shown in UI)
        difficulty: {
            type: Number,
            min: 1,
            max: 5,
            default: 1
        },

        // Rewards
        xpReward: {
            type: Number,
            default: 50
        },
        bonusXP: {
            type: Number,
            default: 20  // Extra XP for 3-star completion
        },

        // Star thresholds (score percentage needed for each star)
        starThresholds: {
            one: { type: Number, default: 50 },    // 50%+ = 1 star
            two: { type: Number, default: 75 },    // 75%+ = 2 stars
            three: { type: Number, default: 90 }   // 90%+ = 3 stars
        },

        // Unlock requirements
        requiredStars: {
            type: Number,
            default: 0  // Total stars from previous quests needed
        },

        // Time limits (optional)
        timeLimit: {
            type: Number,
            default: 0  // 0 = no limit, otherwise seconds
        },

        // Narrative/Story elements
        story: {
            intro: String,      // Brief context before quest
            success: String,    // Shown on completion
            failure: String,    // Shown on failure
            hint: String        // Optional hint shown after first failure
        },

        // Visual
        icon: {
            type: String,
            default: "📋"
        },
        isBoss: {
            type: Boolean,
            default: false
        },

        // Status
        status: {
            type: String,
            enum: ["active", "draft", "hidden"],
            default: "active"
        }
    },
    { timestamps: true }
);

// Compound index for efficient region + order queries
questSchema.index({ region: 1, order: 1 });
questSchema.index({ status: 1 });

// Virtual: Check if this is the first quest in the region
questSchema.virtual("isFirstQuest").get(function () {
    return this.order === 1;
});

module.exports = mongoose.model("Quest", questSchema);
