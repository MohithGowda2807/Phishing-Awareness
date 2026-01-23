const DailyChallenge = require("../models/DailyChallenge");
const Mission = require("../models/Mission");
const Question = require("../models/Question");
const Quest = require("../models/Quest");

/**
 * Get today's daily challenge
 */
exports.getTodayChallenge = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const userId = req.user.id;

        let dailyChallenge = await DailyChallenge.findOne({ date: today })
            .populate("contentId");

        // If no challenge for today, create one
        if (!dailyChallenge) {
            dailyChallenge = await createDailyChallenge(today);
        }

        // Check if user has completed it
        const hasCompleted = dailyChallenge.completions.some(
            c => c.user.toString() === userId
        );

        res.json({
            ...dailyChallenge.toObject(),
            hasCompleted,
            userCompletion: hasCompleted
                ? dailyChallenge.completions.find(c => c.user.toString() === userId)
                : null
        });
    } catch (error) {
        console.error("Get daily challenge error:", error);
        res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
};

/**
 * Complete today's daily challenge
 */
exports.completeDaily = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const userId = req.user.id;
        const { score, timeSpent } = req.body;

        const dailyChallenge = await DailyChallenge.findOne({ date: today });

        if (!dailyChallenge) {
            return res.status(404).json({ message: "No daily challenge available" });
        }

        // Check if already completed
        const alreadyCompleted = dailyChallenge.completions.some(
            c => c.user.toString() === userId
        );

        if (alreadyCompleted) {
            return res.status(400).json({ message: "Already completed today's challenge" });
        }

        // Add completion
        dailyChallenge.completions.push({
            user: userId,
            completedAt: new Date(),
            score,
            timeSpent
        });

        dailyChallenge.totalAttempts += 1;
        dailyChallenge.totalCompletions += 1;

        await dailyChallenge.save();

        // Award bonus XP to user
        const User = require("../models/User");
        const user = await User.findById(userId);
        const bonusXP = Math.floor(dailyChallenge.bonusXP * dailyChallenge.bonusMultiplier);
        user.xp += bonusXP;
        await user.save();

        // Check for achievements
        const { checkAchievements } = require("./achievement.controller");
        const newAchievements = await checkAchievements(userId);

        res.json({
            success: true,
            bonusXp: bonusXP,
            newAchievements
        });
    } catch (error) {
        console.error("Complete daily error:", error);
        res.status(500).json({ message: "Failed to complete daily challenge" });
    }
};

/**
 * Get daily challenge history (last 7 days)
 */
exports.getDailyHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get last 7 days
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split("T")[0]);
        }

        const challenges = await DailyChallenge.find({
            date: { $in: dates }
        }).sort({ date: -1 });

        const history = challenges.map(challenge => {
            const userCompletion = challenge.completions.find(
                c => c.user.toString() === userId
            );

            return {
                date: challenge.date,
                title: challenge.title,
                difficulty: challenge.difficulty,
                completed: !!userCompletion,
                score: userCompletion?.score,
                bonusXP: challenge.bonusXP
            };
        });

        res.json(history);
    } catch (error) {
        console.error("Get daily history error:", error);
        res.status(500).json({ message: "Failed to fetch daily history" });
    }
};

/**
 * Helper: Create daily challenge for a given date
 */
async function createDailyChallenge(date) {
    // Rotate through available content
    // For simplicity, we'll randomly select from available missions/questions

    const contentTypes = ["mission", "question", "quest"];
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

    let content, contentId;

    if (contentType === "mission") {
        const missions = await Mission.find({ status: "published" });
        content = missions[Math.floor(Math.random() * missions.length)];
        contentId = content._id;
    } else if (contentType === "question") {
        const questions = await Question.find({ status: "published" });
        content = questions[Math.floor(Math.random() * questions.length)];
        contentId = content._id;
    } else {
        const quests = await Quest.find({ status: "active" });
        content = quests[Math.floor(Math.random() * quests.length)];
        contentId = content._id;
    }

    const dailyChallenge = await DailyChallenge.create({
        date,
        difficulty: content.difficulty || 3,
        contentType,
        contentId,
        title: `Daily Challenge: ${content.title}`,
        description: content.description || "Complete this challenge for bonus XP!",
        bonusXP: 100,
        bonusMultiplier: 2.0
    });

    return dailyChallenge;
}

module.exports.createDailyChallenge = createDailyChallenge;
