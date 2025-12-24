const mongoose = require("mongoose");

const attackerPersonaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },

        // Persona type
        type: {
            type: String,
            enum: ["corporate_spy", "mass_phisher", "spear_phisher", "pretextor", "tech_scammer"],
            required: true
        },

        // Display info
        displayName: { type: String, required: true },
        icon: { type: String, default: "🎭" },
        description: { type: String },

        // Behavioral patterns
        patterns: {
            urgencyLevel: { type: Number, min: 1, max: 10, default: 5 },
            technicalSophistication: { type: Number, min: 1, max: 10, default: 5 },
            personalization: { type: Number, min: 1, max: 10, default: 5 },
            socialEngineering: { type: Number, min: 1, max: 10, default: 5 }
        },

        // Common tactics
        tactics: [{
            type: String
        }],

        // Target categories
        targetCategories: [{
            type: String,
            enum: ["banking", "payroll", "academic", "healthcare", "social", "technical", "shipping", "prize", "internal"]
        }],

        // Example phrases/patterns
        commonPhrases: [{
            type: String
        }],

        // Learning content
        realWorldExamples: [{
            title: String,
            description: String,
            year: Number
        }],

        // Stats
        timesEncountered: { type: Number, default: 0 },
        userSuccessRate: { type: Number, default: 50 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AttackerPersona", attackerPersonaSchema);
