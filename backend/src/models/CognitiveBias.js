const mongoose = require("mongoose");

/**
 * CognitiveBias Model
 * Stores cognitive bias definitions and training exercises
 */
const cognitiveBiasSchema = new mongoose.Schema(
    {
        // Bias identification
        biasId: {
            type: String,
            required: true,
            unique: true,
            enum: [
                "urgency", "authority", "scarcity", "social_proof",
                "reciprocity", "fear", "anchoring", "bandwagon",
                "confirmation", "availability", "halo_effect"
            ]
        },

        // Display name
        name: {
            type: String,
            required: true
        },

        // Icon/emoji for the bias
        icon: {
            type: String,
            default: "🧠"
        },

        // Short description
        shortDescription: {
            type: String,
            required: true
        },

        // Detailed explanation
        detailedExplanation: {
            type: String,
            required: true
        },

        // How attackers exploit this bias
        attackerExploitation: {
            type: String,
            required: true
        },

        // Real-world examples
        examples: [{
            scenario: String,
            howItWorks: String,
            redFlags: [String]
        }],

        // Defense strategies
        defenseStrategies: [{
            strategy: String,
            explanation: String
        }],

        // Training exercises for this bias
        exercises: [{
            // Exercise type
            type: {
                type: String,
                enum: ["identify", "resist", "analyze", "create_defense"],
                default: "identify"
            },

            // Exercise content
            prompt: String,

            // Scenario to analyze
            scenario: {
                content: String,
                sender: String,
                context: String
            },

            // Options for multiple choice
            options: [{
                text: String,
                isCorrect: Boolean,
                explanation: String
            }],

            // Correct answer explanation
            explanation: String,

            // XP reward
            xpReward: {
                type: Number,
                default: 20
            },

            // Difficulty
            difficulty: {
                type: Number,
                min: 1,
                max: 5,
                default: 2
            }
        }],

        // Scientific references
        references: [{
            title: String,
            source: String,
            url: String
        }],

        // Order in the training module
        order: {
            type: Number,
            default: 0
        },

        // Is this bias module active?
        isActive: {
            type: Boolean,
            default: true
        },

        // Stats
        stats: {
            totalCompletions: { type: Number, default: 0 },
            avgScore: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Index for ordering
cognitiveBiasSchema.index({ order: 1, isActive: 1 });

// Static method to get all active biases in order
cognitiveBiasSchema.statics.getAllActive = function () {
    return this.find({ isActive: true }).sort({ order: 1 });
};

// Method to update completion stats
cognitiveBiasSchema.methods.updateStats = function (score) {
    const totalCompletions = this.stats.totalCompletions + 1;
    const avgScore = Math.round(
        ((this.stats.avgScore * this.stats.totalCompletions) + score) / totalCompletions
    );

    this.stats.totalCompletions = totalCompletions;
    this.stats.avgScore = avgScore;

    return this.save();
};

module.exports = mongoose.model("CognitiveBias", cognitiveBiasSchema);
