const CyberScore = require("../models/CyberScore");
const User = require("../models/User");

/**
 * Risk Score Controller
 * Handles cyber defense score calculation and sharing
 */

// Calculate score components
const calculateScoreComponents = (user) => {
    const components = {};

    // 1. Accuracy (0-40 points)
    const accuracy = user.totalDecisions > 0
        ? (user.correctDecisions / user.totalDecisions) * 100
        : 0;
    components.accuracy = {
        value: Math.round((accuracy / 100) * 40),
        maxPoints: 40,
        details: {
            correctDecisions: user.correctDecisions || 0,
            totalDecisions: user.totalDecisions || 0,
            percentage: Math.round(accuracy)
        }
    };

    // 2. Breadth - Training modules completed (0-20 points)
    const totalModules = 12;  // Total available modules
    const completedModules = user.completedModules?.length || 0;
    const breadthPercent = Math.min(completedModules / totalModules, 1);
    components.breadth = {
        value: Math.round(breadthPercent * 20),
        maxPoints: 20,
        details: {
            modulesCompleted: completedModules,
            totalModules,
            percentage: Math.round(breadthPercent * 100)
        }
    };

    // 3. Consistency - Streak (0-15 points)
    const streakDays = Math.min(user.streak || 0, 30);  // Cap at 30 days
    const longestStreak = user.longestStreak || 0;
    components.consistency = {
        value: Math.round((streakDays / 30) * 15),
        maxPoints: 15,
        details: {
            currentStreak: user.streak || 0,
            longestStreak
        }
    };

    // 4. Improvement (0-15 points)
    // Calculate based on score history trend
    const scoreHistory = user.scoreHistory || [];
    let trend = "stable";
    let percentChange = 0;

    if (scoreHistory.length >= 2) {
        const recent = scoreHistory.slice(-5);  // Last 5 scores
        const older = scoreHistory.slice(-10, -5);  // Previous 5 scores

        if (older.length > 0) {
            const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
            const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;
            percentChange = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);

            if (percentChange > 5) trend = "improving";
            else if (percentChange < -5) trend = "declining";
        }
    }

    const improvementScore = trend === "improving" ? 15 : (trend === "stable" ? 10 : 5);
    components.improvement = {
        value: improvementScore,
        maxPoints: 15,
        details: { trend, percentChange }
    };

    // 5. Community (0-10 points)
    const communityStats = user.communityStats || {};
    const challengesCreated = communityStats.challengesCreated || 0;
    const upvotesReceived = communityStats.totalUpvotesReceived || 0;
    const communityScore = Math.min(
        (challengesCreated * 2) + (upvotesReceived * 0.5),
        10
    );
    components.community = {
        value: Math.round(communityScore),
        maxPoints: 10,
        details: {
            challengesCreated,
            upvotesReceived
        }
    };

    return components;
};

// Identify strengths and weaknesses
const identifyStrengthsWeaknesses = (user, components) => {
    const strengths = [];
    const weaknesses = [];

    // Accuracy
    if (components.accuracy.details.percentage >= 80) {
        strengths.push({
            area: "Threat Detection",
            description: "Excellent at identifying phishing attempts"
        });
    } else if (components.accuracy.details.percentage < 60) {
        weaknesses.push({
            area: "Threat Detection",
            description: "Need improvement in recognizing phishing indicators",
            improvementTip: "Focus on examining sender addresses and URL structures"
        });
    }

    // Breadth
    if (components.breadth.details.percentage >= 80) {
        strengths.push({
            area: "Training Breadth",
            description: "Comprehensive coverage of attack vectors"
        });
    } else if (components.breadth.details.percentage < 50) {
        weaknesses.push({
            area: "Training Coverage",
            description: "Many attack types not yet explored",
            improvementTip: "Complete more training modules to cover different threat types"
        });
    }

    // Consistency
    if (components.consistency.details.currentStreak >= 14) {
        strengths.push({
            area: "Consistency",
            description: "Maintaining excellent training routine"
        });
    } else if (components.consistency.details.currentStreak < 3) {
        weaknesses.push({
            area: "Regular Practice",
            description: "Irregular training can reduce retention",
            improvementTip: "Try to train at least 5 minutes daily"
        });
    }

    // Check user's weak categories from behavior profile
    const weakCategories = user.behaviorProfile?.weakCategories || [];
    weakCategories.forEach(category => {
        weaknesses.push({
            area: `${category} Threats`,
            description: `Higher vulnerability to ${category} phishing attempts`,
            improvementTip: `Practice more ${category} scenarios`
        });
    });

    const strongCategories = user.behaviorProfile?.strongCategories || [];
    strongCategories.forEach(category => {
        strengths.push({
            area: `${category} Threats`,
            description: `Strong detection of ${category} phishing`
        });
    });

    return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) };
};

// Generate a new cyber score
exports.generateScore = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate components
        const components = calculateScoreComponents(user);

        // Calculate total score
        const totalScore = Object.values(components).reduce(
            (sum, comp) => sum + comp.value, 0
        );

        // Determine tier
        const tier = CyberScore.calculateTier(totalScore);

        // Identify strengths and weaknesses
        const { strengths, weaknesses } = identifyStrengthsWeaknesses(user, components);

        // Create validity window (90 days)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 90);

        // Create new score record
        const cyberScore = new CyberScore({
            user: userId,
            score: totalScore,
            tier,
            components,
            strengths,
            weaknesses,
            validUntil
        });

        await cyberScore.save();

        // Update user's score history
        await User.findByIdAndUpdate(userId, {
            $push: {
                scoreHistory: {
                    score: totalScore,
                    tier,
                    generatedAt: new Date()
                }
            }
        });

        res.json({
            score: totalScore,
            tier,
            components,
            strengths,
            weaknesses,
            shareToken: cyberScore.shareToken,
            validUntil,
            shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/score/${cyberScore.shareToken}`
        });
    } catch (error) {
        console.error("Error generating score:", error);
        res.status(500).json({ message: "Failed to generate score" });
    }
};

// Get user's latest score
exports.getLatestScore = async (req, res) => {
    try {
        const userId = req.user._id;

        const latestScore = await CyberScore.getLatestScore(userId);

        if (!latestScore) {
            return res.json({
                hasScore: false,
                message: "No score generated yet"
            });
        }

        res.json({
            hasScore: true,
            score: latestScore.score,
            tier: latestScore.tier,
            components: latestScore.components,
            strengths: latestScore.strengths,
            weaknesses: latestScore.weaknesses,
            shareToken: latestScore.shareToken,
            generatedAt: latestScore.generatedAt,
            validUntil: latestScore.validUntil,
            isValid: latestScore.checkValidity()
        });
    } catch (error) {
        console.error("Error fetching latest score:", error);
        res.status(500).json({ message: "Failed to fetch score" });
    }
};

// Verify a score by share token (public endpoint)
exports.verifyScore = async (req, res) => {
    try {
        const { token } = req.params;

        const score = await CyberScore.verifyByToken(token);

        if (!score) {
            return res.status(404).json({
                verified: false,
                message: "Score not found or invalid"
            });
        }

        const isValid = score.checkValidity();

        res.json({
            verified: true,
            isValid,
            username: score.user?.username || "Anonymous",
            userLevel: score.user?.level || 1,
            userTier: score.user?.tier || "bronze",
            score: score.score,
            tier: score.tier,
            generatedAt: score.generatedAt,
            validUntil: score.validUntil,
            components: {
                accuracy: score.components.accuracy.details.percentage,
                breadth: score.components.breadth.details.percentage,
                consistency: score.components.consistency.details.currentStreak,
                trend: score.components.improvement.details.trend
            }
        });
    } catch (error) {
        console.error("Error verifying score:", error);
        res.status(500).json({ message: "Failed to verify score" });
    }
};

// Get score history
exports.getScoreHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const scores = await CyberScore.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("score tier generatedAt validUntil isValid");

        res.json({ scores });
    } catch (error) {
        console.error("Error fetching score history:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// Track score view
exports.trackScoreView = async (req, res) => {
    try {
        const { token } = req.params;

        const score = await CyberScore.findOne({ shareToken: token });
        if (score) {
            await score.trackView();
        }

        res.json({ tracked: true });
    } catch (error) {
        // Silent fail for tracking
        res.json({ tracked: false });
    }
};

// Get leaderboard by cyber score
exports.getScoreLeaderboard = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Get latest valid scores grouped by user
        const leaderboard = await CyberScore.aggregate([
            {
                $match: {
                    isValid: true,
                    validUntil: { $gt: new Date() }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$user",
                    latestScore: { $first: "$score" },
                    latestTier: { $first: "$tier" },
                    generatedAt: { $first: "$generatedAt" }
                }
            },
            { $sort: { latestScore: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    username: "$user.username",
                    level: "$user.level",
                    score: "$latestScore",
                    tier: "$latestTier",
                    generatedAt: 1
                }
            }
        ]);

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        res.json({ leaderboard: rankedLeaderboard });
    } catch (error) {
        console.error("Error fetching score leaderboard:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
};
