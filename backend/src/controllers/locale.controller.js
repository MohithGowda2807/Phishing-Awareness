const LocalizedScenario = require("../models/LocalizedScenario");
const User = require("../models/User");

/**
 * Locale Controller
 * Handles localized threat scenarios and training
 */

// Get user's locale or detect from request
const detectLocale = (req) => {
    // Priority: user preference > header > default
    if (req.user?.locale) {
        return req.user.locale;
    }

    // Try to detect from Accept-Language header
    const acceptLanguage = req.headers["accept-language"] || "";
    if (acceptLanguage.includes("en-IN") || acceptLanguage.includes("hi")) {
        return "IN";
    }
    if (acceptLanguage.includes("en-US")) {
        return "US";
    }
    if (acceptLanguage.includes("en-GB")) {
        return "UK";
    }

    return "GLOBAL";
};

// Get scenarios for user's locale
exports.getLocalizedScenarios = async (req, res) => {
    try {
        const locale = detectLocale(req);
        const { category, difficulty, limit = 10 } = req.query;

        const query = {
            isActive: true,
            $or: [{ locale }, { locale: "GLOBAL" }]  // Include global scenarios
        };

        if (category) query.category = category;
        if (difficulty) query.difficulty = parseInt(difficulty);

        const scenarios = await LocalizedScenario.find(query)
            .sort({ locale: -1, difficulty: 1 })  // Prioritize locale-specific
            .limit(parseInt(limit))
            .select("-redFlags.location");  // Don't reveal red flag locations

        res.json({
            locale,
            count: scenarios.length,
            scenarios
        });
    } catch (error) {
        console.error("Error fetching localized scenarios:", error);
        res.status(500).json({ message: "Failed to fetch scenarios" });
    }
};

// Get a single random scenario for training
exports.getRandomScenario = async (req, res) => {
    try {
        const locale = detectLocale(req);
        const { category, difficulty } = req.query;

        const query = {
            isActive: true,
            $or: [{ locale }, { locale: "GLOBAL" }]
        };

        if (category) query.category = category;
        if (difficulty) query.difficulty = parseInt(difficulty);

        // Get random scenario using aggregation
        const scenarios = await LocalizedScenario.aggregate([
            { $match: query },
            { $sample: { size: 1 } }
        ]);

        if (scenarios.length === 0) {
            return res.status(404).json({ message: "No scenarios found" });
        }

        const scenario = scenarios[0];

        // Remove red flag details for the challenge
        const challengeScenario = {
            _id: scenario._id,
            title: scenario.title,
            category: scenario.category,
            difficulty: scenario.difficulty,
            content: scenario.content,
            xpReward: scenario.xpReward
        };

        res.json(challengeScenario);
    } catch (error) {
        console.error("Error fetching random scenario:", error);
        res.status(500).json({ message: "Failed to fetch scenario" });
    }
};

// Submit answer for a scenario
exports.submitScenarioAnswer = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const { answer, timeSpent } = req.body;  // answer: "phishing" or "legitimate"
        const userId = req.user._id;

        const scenario = await LocalizedScenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({ message: "Scenario not found" });
        }

        const isCorrect = (answer === "phishing") === scenario.isPhishing;

        // Update scenario stats
        await scenario.updateStats(isCorrect);

        // Update user XP if correct
        let xpEarned = 0;
        if (isCorrect) {
            xpEarned = scenario.xpReward;
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    xp: xpEarned,
                    correctDecisions: 1,
                    totalDecisions: 1
                }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $inc: { totalDecisions: 1 }
            });
        }

        // Return full scenario details with explanation
        res.json({
            isCorrect,
            xpEarned,
            scenario: {
                isPhishing: scenario.isPhishing,
                redFlags: scenario.redFlags,
                explanation: scenario.explanation,
                culturalContext: scenario.culturalContext
            }
        });
    } catch (error) {
        console.error("Error submitting scenario answer:", error);
        res.status(500).json({ message: "Failed to submit answer" });
    }
};

// Get available categories for a locale
exports.getCategories = async (req, res) => {
    try {
        const locale = detectLocale(req);

        const categories = await LocalizedScenario.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [{ locale }, { locale: "GLOBAL" }]
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    avgDifficulty: { $avg: "$difficulty" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({ locale, categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

// Update user's locale preference
exports.updateLocale = async (req, res) => {
    try {
        const { locale } = req.body;
        const userId = req.user._id;

        if (!["IN", "US", "UK", "GLOBAL"].includes(locale)) {
            return res.status(400).json({ message: "Invalid locale" });
        }

        await User.findByIdAndUpdate(userId, { locale });

        res.json({ message: "Locale updated", locale });
    } catch (error) {
        console.error("Error updating locale:", error);
        res.status(500).json({ message: "Failed to update locale" });
    }
};

// Get locale-specific stats
exports.getLocaleStats = async (req, res) => {
    try {
        const locale = detectLocale(req);

        const stats = await LocalizedScenario.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [{ locale }, { locale: "GLOBAL" }]
                }
            },
            {
                $group: {
                    _id: null,
                    totalScenarios: { $sum: 1 },
                    avgSuccessRate: { $avg: "$successRate" },
                    categories: { $addToSet: "$category" }
                }
            }
        ]);

        res.json({
            locale,
            stats: stats[0] || {
                totalScenarios: 0,
                avgSuccessRate: 0,
                categories: []
            }
        });
    } catch (error) {
        console.error("Error fetching locale stats:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
