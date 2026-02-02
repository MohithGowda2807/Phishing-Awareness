const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * CyberScore Model
 * Stores shareable cyber defense scores for users
 */
const cyberScoreSchema = new mongoose.Schema(
    {
        // User reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Unique share token for this score
        shareToken: {
            type: String,
            unique: true,
            required: true
        },

        // Overall score (0-100)
        score: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        // Score tier
        tier: {
            type: String,
            enum: ["novice", "aware", "vigilant", "defender", "expert", "elite"],
            required: true
        },

        // Score breakdown components
        components: {
            // Accuracy in identifying threats (0-40 points)
            accuracy: {
                value: { type: Number, default: 0 },
                maxPoints: { type: Number, default: 40 },
                details: {
                    correctDecisions: Number,
                    totalDecisions: Number,
                    percentage: Number
                }
            },

            // Training breadth (0-20 points)
            breadth: {
                value: { type: Number, default: 0 },
                maxPoints: { type: Number, default: 20 },
                details: {
                    modulesCompleted: Number,
                    totalModules: Number,
                    percentage: Number
                }
            },

            // Consistency/Streak (0-15 points)
            consistency: {
                value: { type: Number, default: 0 },
                maxPoints: { type: Number, default: 15 },
                details: {
                    currentStreak: Number,
                    longestStreak: Number
                }
            },

            // Improvement over time (0-15 points)
            improvement: {
                value: { type: Number, default: 0 },
                maxPoints: { type: Number, default: 15 },
                details: {
                    trend: String,  // "improving", "stable", "declining"
                    percentChange: Number
                }
            },

            // Community contribution (0-10 points)
            community: {
                value: { type: Number, default: 0 },
                maxPoints: { type: Number, default: 10 },
                details: {
                    challengesCreated: Number,
                    upvotesReceived: Number
                }
            }
        },

        // Weaknesses identified
        weaknesses: [{
            area: String,
            description: String,
            improvementTip: String
        }],

        // Strengths identified
        strengths: [{
            area: String,
            description: String
        }],

        // Validity period
        generatedAt: {
            type: Date,
            default: Date.now
        },

        validUntil: {
            type: Date,
            required: true
        },

        // Is this score still valid?
        isValid: {
            type: Boolean,
            default: true
        },

        // View count
        viewCount: {
            type: Number,
            default: 0
        },

        // Verification count
        verificationCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Indexes
cyberScoreSchema.index({ user: 1, createdAt: -1 });
cyberScoreSchema.index({ shareToken: 1 });

// Pre-save hook to generate share token
cyberScoreSchema.pre("save", function (next) {
    if (!this.shareToken) {
        this.shareToken = "cs_" + crypto.randomBytes(16).toString("hex");
    }
    next();
});

// Static method to calculate tier from score
cyberScoreSchema.statics.calculateTier = function (score) {
    if (score >= 90) return "elite";
    if (score >= 80) return "expert";
    if (score >= 70) return "defender";
    if (score >= 55) return "vigilant";
    if (score >= 40) return "aware";
    return "novice";
};

// Static method to get user's latest valid score
cyberScoreSchema.statics.getLatestScore = function (userId) {
    return this.findOne({
        user: userId,
        isValid: true,
        validUntil: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

// Static method to verify a score by token
cyberScoreSchema.statics.verifyByToken = async function (token) {
    const score = await this.findOne({ shareToken: token })
        .populate("user", "username level tier");

    if (score) {
        score.verificationCount += 1;
        await score.save();
    }

    return score;
};

// Method to check if score is still valid
cyberScoreSchema.methods.checkValidity = function () {
    if (this.validUntil < new Date()) {
        this.isValid = false;
        return false;
    }
    return true;
};

// Method to increment view count
cyberScoreSchema.methods.trackView = function () {
    this.viewCount += 1;
    return this.save();
};

module.exports = mongoose.model("CyberScore", cyberScoreSchema);
