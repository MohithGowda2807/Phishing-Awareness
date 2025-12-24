const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
    {
        // Creator
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Challenge Content
        title: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["phishing", "legitimate"],
            required: true
        },

        difficulty: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        category: {
            type: String,
            enum: ["banking", "payroll", "academic", "healthcare", "social", "technical", "shipping", "prize", "internal"],
            required: true
        },

        // Email Content
        emailContent: {
            from: { type: String, required: true },
            fromName: { type: String },
            subject: { type: String, required: true },
            body: { type: String, required: true },
            headers: {
                spf: { type: String, default: "fail" },
                dkim: { type: String, default: "none" },
                dmarc: { type: String, default: "fail" }
            }
        },

        // Clues/indicators
        clues: [{
            type: String,
            required: true
        }],

        // Explanation shown after challenge
        explanation: {
            type: String
        },

        // Voting
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        voters: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            vote: { type: String, enum: ["up", "down"] }
        }],

        // Status
        status: {
            type: String,
            enum: ["pending", "approved", "featured", "rejected"],
            default: "pending"
        },

        // Moderation
        moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        moderationNote: { type: String },

        // Stats
        timesPlayed: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Calculate net votes
challengeSchema.virtual("netVotes").get(function () {
    return this.upvotes - this.downvotes;
});

// Index for efficient queries
challengeSchema.index({ status: 1, upvotes: -1 });
challengeSchema.index({ creator: 1 });
challengeSchema.index({ category: 1 });

module.exports = mongoose.model("Challenge", challengeSchema);
