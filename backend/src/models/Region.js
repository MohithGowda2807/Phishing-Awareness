const mongoose = require("mongoose");

/**
 * Region Model
 * 
 * Represents a topic area on the world map (Phishing, Passwords, Malware, etc.)
 * Each region contains multiple quests that teach specific skills.
 */
const regionSchema = new mongoose.Schema(
    {
        // Basic info
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true  // Stable identifier like "PHISHING", "PASSWORDS"
        },
        description: {
            type: String,
            required: true
        },

        // Visual
        icon: {
            type: String,
            default: "🎯"  // Emoji or icon class
        },
        color: {
            type: String,
            default: "emerald"  // Tailwind color name
        },
        backgroundImage: String,

        // Map position (for visual world map layout)
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            row: { type: Number, default: 0 },
            col: { type: Number, default: 0 }
        },

        // Display order
        order: {
            type: Number,
            default: 0
        },

        // Unlock requirements
        requiredLevel: {
            type: Number,
            default: 1
        },
        prerequisiteRegions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region"
        }],
        requiredStarsFromPrevious: {
            type: Number,
            default: 0  // Stars needed from previous region to unlock
        },

        // Narrative/Story elements
        story: {
            intro: String,        // Shown when entering region
            completion: String,   // Shown when completing all quests
            antagonist: String    // Optional villain/threat for this region
        },

        // Computed stats (updated when quests change)
        totalQuests: {
            type: Number,
            default: 0
        },
        totalXP: {
            type: Number,
            default: 0
        },
        maxStars: {
            type: Number,
            default: 0  // totalQuests * 3
        },

        // Status
        status: {
            type: String,
            enum: ["active", "coming_soon", "hidden"],
            default: "active"
        }
    },
    { timestamps: true }
);

// Index for efficient queries
regionSchema.index({ order: 1 });
regionSchema.index({ code: 1 });
regionSchema.index({ status: 1 });

module.exports = mongoose.model("Region", regionSchema);
