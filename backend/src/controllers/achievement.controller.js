const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const User = require("../models/User");

/**
 * Get all achievements with user's progress
 */
exports.getAllAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all active achievements
        const achievements = await Achievement.find({ isActive: true }).sort({ order: 1 });

        // Get user's unlocked achievements
        const userAchievements = await UserAchievement.find({ user: userId });
        const unlockedIds = new Set(userAchievements.map(ua => ua.achievement.toString()));

        // Combine data
        const achievementsWithProgress = achievements.map(achievement => {
            const userAchievement = userAchievements.find(
                ua => ua.achievement.toString() === achievement._id.toString()
            );

            return {
                ...achievement.toObject(),
                isUnlocked: unlockedIds.has(achievement._id.toString()),
                unlockedAt: userAchievement?.unlockedAt,
                isShowcased: userAchievement?.isShowcased || false,
                progress: userAchievement?.progress
            };
        });

        res.json(achievementsWithProgress);
    } catch (error) {
        console.error("Get achievements error:", error);
        res.status(500).json({ message: "Failed to fetch achievements" });
    }
};

/**
 * Get user's unlocked achievements
 */
exports.getUserAchievements = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const userAchievements = await UserAchievement.find({ user: userId })
            .populate("achievement")
            .sort({ unlockedAt: -1 });

        res.json(userAchievements);
    } catch (error) {
        console.error("Get user achievements error:", error);
        res.status(500).json({ message: "Failed to fetch user achievements" });
    }
};

/**
 * Showcase/unshowcase an achievement on profile
 */
exports.toggleShowcase = async (req, res) => {
    try {
        const userId = req.user.id;
        const { achievementId } = req.params;

        // Check if user has this achievement
        const userAchievement = await UserAchievement.findOne({
            user: userId,
            achievement: achievementId
        });

        if (!userAchievement) {
            return res.status(404).json({ message: "Achievement not unlocked" });
        }

        // Toggle showcase
        userAchievement.isShowcased = !userAchievement.isShowcased;

        // Limit to 3 showcased achievements
        if (userAchievement.isShowcased) {
            const showcasedCount = await UserAchievement.countDocuments({
                user: userId,
                isShowcased: true
            });

            if (showcasedCount >= 3) {
                return res.status(400).json({ message: "Maximum 3 achievements can be showcased" });
            }
        }

        await userAchievement.save();
        res.json(userAchievement);
    } catch (error) {
        console.error("Toggle showcase error:", error);
        res.status(500).json({ message: "Failed to update showcase" });
    }
};

/**
 * Check and unlock achievements for a user
 * Called after completing missions, gaining XP, etc.
 */
exports.checkAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const newlyUnlocked = [];

        // Get all achievements user hasn't unlocked yet
        const unlockedAchievements = await UserAchievement.find({ user: userId });
        const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievement.toString()));

        const achievements = await Achievement.find({
            isActive: true,
            _id: { $nin: Array.from(unlockedIds) }
        });

        // Check each achievement's requirements
        for (const achievement of achievements) {
            let shouldUnlock = false;

            switch (achievement.requirements.type) {
                case "first_mission":
                    shouldUnlock = user.missionsCompleted >= 1;
                    break;

                case "missions_completed":
                    shouldUnlock = user.missionsCompleted >= achievement.requirements.value;
                    break;

                case "level_reached":
                    shouldUnlock = user.level >= achievement.requirements.value;
                    break;

                case "xp_earned":
                    shouldUnlock = user.xp >= achievement.requirements.value;
                    break;

                case "streak_days":
                    shouldUnlock = user.streak >= achievement.requirements.value;
                    break;

                case "perfect_scores":
                    // Assuming we track this in user model (need to add field)
                    shouldUnlock = (user.perfectScores || 0) >= achievement.requirements.value;
                    break;

                case "stars_earned":
                    // Need to calculate total stars from UserProgress
                    shouldUnlock = (user.totalStars || 0) >= achievement.requirements.value;
                    break;

                case "challenges_created":
                    // Would need to count from Challenge model
                    const Challenge = require("../models/Challenge");
                    const challengeCount = await Challenge.countDocuments({
                        createdBy: userId,
                        status: { $in: ["published", "pending"] }
                    });
                    shouldUnlock = challengeCount >= achievement.requirements.value;
                    break;
            }

            if (shouldUnlock) {
                // Unlock achievement
                const userAchievement = await UserAchievement.create({
                    user: userId,
                    achievement: achievement._id,
                    unlockedAt: new Date()
                });

                // Award XP reward
                if (achievement.rewards.xp) {
                    user.xp += achievement.rewards.xp;
                }

                newlyUnlocked.push({
                    ...achievement.toObject(),
                    userAchievement
                });
            }
        }

        // Save user if XP was awarded
        if (newlyUnlocked.length > 0) {
            await user.save();
        }

        return newlyUnlocked;
    } catch (error) {
        console.error("Check achievements error:", error);
        return [];
    }
};

/**
 * Mark achievement notification as viewed
 */
exports.markViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { achievementId } = req.params;

        await UserAchievement.findOneAndUpdate(
            { user: userId, achievement: achievementId },
            { isViewed: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Mark viewed error:", error);
        res.status(500).json({ message: "Failed to mark as viewed" });
    }
};

/**
 * Get recently unlocked achievements (for notifications)
 */
exports.getRecentUnlocks = async (req, res) => {
    try {
        const userId = req.user.id;

        const recentUnlocks = await UserAchievement.find({
            user: userId,
            isViewed: false
        })
            .populate("achievement")
            .sort({ unlockedAt: -1 })
            .limit(10);

        res.json(recentUnlocks);
    } catch (error) {
        console.error("Get recent unlocks error:", error);
        res.status(500).json({ message: "Failed to fetch recent unlocks" });
    }
};
