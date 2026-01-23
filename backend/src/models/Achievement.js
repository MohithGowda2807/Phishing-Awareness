const mongoose = require("mongoose");

/**
 * Achievement Model
 * 
 * Defines all possible achievements users can unlock
 */
const achievementSchema = new mongoose.Schema(
    {
        // Unique identifier
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },

        // Display info
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: "🏆"
        },

        // Category for organization
        category: {
            type: String,
            enum: ["first_steps", "milestone", "mastery", "social", "special", "competitive", "speed"],
            default: "milestone"
        },

        // Rarity affects display
        rarity: {
            type: String,
            enum: ["common", "rare", "epic", "legendary"],
            default: "common"
        },

        // Requirements to unlock
        requirements: {
            type: {
                type: String,
                enum: ["missions_completed", "xp_earned", "streak_days", "perfect_scores",
                    "region_completed", "all_regions_mastered", "challenges_created",
                    "first_mission", "level_reached", "stars_earned"],
                required: true
            },
            value: Number,  // e.g., 10 missions, 5 days streak
            regionId: {     // For region-specific achievements
                type: mongoose.Schema.Types.ObjectId,
                ref: "Region"
            }
        },

        // Rewards
        rewards: {
            xp: {
                type: Number,
                default: 0
            },
            title: String  // Unlocked title users can display
        },

        // Display order in gallery
        order: {
            type: Number,
            default: 0
        },

        // Hidden until unlocked
        isSecret: {
            type: Boolean,
            default: false
        },

        // Active/inactive
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Indexes
achievementSchema.index({ code: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ isActive: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
