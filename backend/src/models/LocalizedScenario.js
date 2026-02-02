const mongoose = require("mongoose");

/**
 * LocalizedScenario Model
 * Stores region-specific phishing scenarios for localized training
 */
const localizedScenarioSchema = new mongoose.Schema(
    {
        // Scenario identification
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Region/Locale (e.g., "IN" for India, "US" for USA, "GLOBAL" for generic)
        locale: {
            type: String,
            required: true,
            enum: ["IN", "US", "UK", "GLOBAL"],
            default: "GLOBAL"
        },

        // Scenario category
        category: {
            type: String,
            required: true,
            enum: [
                "banking", "payment", "government", "education",
                "healthcare", "shopping", "social", "tech_support",
                "lottery", "job_offer", "delivery"
            ]
        },

        // Is this a phishing attempt or legitimate?
        isPhishing: {
            type: Boolean,
            required: true
        },

        // Difficulty level (1-5)
        difficulty: {
            type: Number,
            min: 1,
            max: 5,
            default: 2
        },

        // The scenario content
        content: {
            // Email/SMS type scenario
            type: {
                type: String,
                enum: ["email", "sms", "website", "call"],
                default: "email"
            },

            // Sender information
            sender: {
                name: String,
                email: String,
                phone: String
            },

            // Subject line (for emails)
            subject: String,

            // Main body content (supports HTML for emails)
            body: {
                type: String,
                required: true
            },

            // Attachments (if any)
            attachments: [{
                name: String,
                extension: String,
                isMalicious: Boolean
            }],

            // Links in the content
            links: [{
                displayText: String,
                actualUrl: String,
                isMalicious: Boolean
            }],

            // Call-to-action button
            ctaButton: {
                text: String,
                url: String,
                isMalicious: Boolean
            }
        },

        // Red flags that indicate this is phishing
        redFlags: [{
            type: {
                type: String,
                enum: [
                    "urgency", "authority", "scarcity", "social_proof",
                    "reciprocity", "fear", "greed", "curiosity",
                    "typo", "wrong_domain", "generic_greeting",
                    "suspicious_link", "request_info", "threat"
                ]
            },
            description: String,
            location: String  // Where in the content this red flag appears
        }],

        // Learning points after completing the scenario
        explanation: {
            type: String,
            required: true
        },

        // Localized cultural context (why this scam works in this region)
        culturalContext: String,

        // XP reward for correct identification
        xpReward: {
            type: Number,
            default: 25
        },

        // Times this scenario was played
        timesPlayed: {
            type: Number,
            default: 0
        },

        // Success rate (percentage of correct identifications)
        successRate: {
            type: Number,
            default: 50
        },

        // Is this scenario active?
        isActive: {
            type: Boolean,
            default: true
        },

        // Tags for filtering
        tags: [String]
    },
    { timestamps: true }
);

// Index for efficient locale-based queries
localizedScenarioSchema.index({ locale: 1, category: 1, isActive: 1 });
localizedScenarioSchema.index({ locale: 1, difficulty: 1 });

// Static method to get scenarios by locale
localizedScenarioSchema.statics.getByLocale = function (locale, options = {}) {
    const query = { locale, isActive: true };

    if (options.category) {
        query.category = options.category;
    }

    if (options.difficulty) {
        query.difficulty = options.difficulty;
    }

    return this.find(query).sort({ difficulty: 1 });
};

// Method to update stats after play
localizedScenarioSchema.methods.updateStats = function (wasCorrect) {
    this.timesPlayed += 1;
    // Rolling average
    this.successRate = Math.round(
        ((this.successRate * (this.timesPlayed - 1)) + (wasCorrect ? 100 : 0)) / this.timesPlayed
    );
    return this.save();
};

module.exports = mongoose.model("LocalizedScenario", localizedScenarioSchema);
