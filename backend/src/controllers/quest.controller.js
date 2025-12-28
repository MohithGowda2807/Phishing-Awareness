const Region = require("../models/Region");
const Quest = require("../models/Quest");
const UserProgress = require("../models/UserProgress");
const { calculateXP, calculateLevel, calculateTier } = require("../utils/gamification");
const User = require("../models/User");

/**
 * Get all regions with user progress
 */
exports.getRegions = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get all active regions
        const regions = await Region.find({ status: "active" })
            .sort({ order: 1 })
            .lean();

        // Get user progress if authenticated
        let userProgress = null;
        if (userId) {
            userProgress = await UserProgress.findOne({ userId }).lean();
        }

        // Enhance regions with progress and unlock status
        const regionsWithProgress = regions.map((region, index) => {
            const progress = userProgress?.regionProgress?.find(
                rp => rp.regionId?.toString() === region._id.toString()
            );

            // First region is always unlocked, others depend on prerequisites
            let isUnlocked = index === 0;

            if (!isUnlocked && userProgress) {
                // Check if user meets level requirement
                const user = req.user;
                if (user?.level >= region.requiredLevel) {
                    // Check if prerequisite regions are completed
                    if (region.prerequisiteRegions?.length === 0) {
                        // Check previous region by order
                        const prevRegion = regions[index - 1];
                        if (prevRegion) {
                            const prevProgress = userProgress.regionProgress?.find(
                                rp => rp.regionId?.toString() === prevRegion._id.toString()
                            );
                            isUnlocked = prevProgress?.isCompleted ||
                                (prevProgress?.totalStars >= region.requiredStarsFromPrevious);
                        }
                    } else {
                        // Check specific prerequisites
                        isUnlocked = region.prerequisiteRegions.every(prereqId => {
                            const prereqProgress = userProgress.regionProgress?.find(
                                rp => rp.regionId?.toString() === prereqId.toString()
                            );
                            return prereqProgress?.isCompleted;
                        });
                    }
                }
            }

            return {
                ...region,
                isUnlocked: progress?.isUnlocked || isUnlocked,
                progress: progress ? {
                    totalStars: progress.totalStars,
                    questsCompleted: progress.questsCompleted,
                    isCompleted: progress.isCompleted
                } : null
            };
        });

        res.json(regionsWithProgress);
    } catch (error) {
        console.error("Get regions error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get single region with its quests
 */
exports.getRegionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const region = await Region.findById(id).lean();
        if (!region) {
            return res.status(404).json({ message: "Region not found" });
        }

        // Get quests for this region
        const quests = await Quest.find({ region: id, status: "active" })
            .sort({ order: 1 })
            .lean();

        // Get user progress
        let userProgress = null;
        if (userId) {
            userProgress = await UserProgress.findOne({ userId }).lean();
        }

        // Get region progress
        const regionProgress = userProgress?.regionProgress?.find(
            rp => rp.regionId?.toString() === id
        );

        // Calculate cumulative stars for unlock checking
        let cumulativeStars = 0;

        // Enhance quests with progress
        const questsWithProgress = quests.map((quest, index) => {
            const progress = userProgress?.questProgress?.find(
                qp => qp.questId?.toString() === quest._id.toString()
            );

            // First quest is always unlocked, others depend on stars
            const isUnlocked = index === 0 || cumulativeStars >= quest.requiredStars;

            // Add this quest's stars to cumulative
            if (progress?.stars) {
                cumulativeStars += progress.stars;
            }

            return {
                ...quest,
                isUnlocked,
                progress: progress ? {
                    isCompleted: progress.isCompleted,
                    stars: progress.stars,
                    bestScore: progress.bestScore,
                    attempts: progress.attempts
                } : null
            };
        });

        res.json({
            region: {
                ...region,
                progress: regionProgress
            },
            quests: questsWithProgress
        });
    } catch (error) {
        console.error("Get region error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get single quest details
 */
exports.getQuestById = async (req, res) => {
    try {
        const { id } = req.params;

        const quest = await Quest.findById(id)
            .populate("region", "name code icon color")
            .populate("linkedContent.missionId")
            .populate("linkedContent.questionId")
            .lean();

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // Get user progress for this quest
        const userId = req.user?.id;
        let progress = null;

        if (userId) {
            const userProgress = await UserProgress.findOne({ userId }).lean();
            progress = userProgress?.questProgress?.find(
                qp => qp.questId?.toString() === id
            );
        }

        res.json({
            ...quest,
            progress
        });
    } catch (error) {
        console.error("Get quest error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Complete a quest and update progress
 */
exports.completeQuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const quest = await Quest.findById(id);
        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // Get or create user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            userProgress = new UserProgress({ userId });
        }

        // Get quest progress
        let questProgress = userProgress.getQuestProgress(id, quest.region);

        // Calculate stars
        const stars = UserProgress.calculateStars(score, quest.starThresholds);

        // Calculate XP earned
        let xpEarned = Math.round((score / 100) * quest.xpReward);
        if (stars === 3) {
            xpEarned += quest.bonusXP;  // Perfect score bonus
        }

        // Update quest progress
        const previousStars = questProgress.stars;
        const isNewCompletion = !questProgress.isCompleted;

        questProgress.attempts += 1;
        questProgress.lastAttemptAt = new Date();

        // Only update if better than before
        if (score > questProgress.bestScore) {
            questProgress.bestScore = score;
            questProgress.stars = stars;
        }

        if (!questProgress.isCompleted && stars >= 1) {
            questProgress.isCompleted = true;
            questProgress.completedAt = new Date();
        }

        // Update region progress
        let regionProgress = userProgress.getRegionProgress(quest.region);

        if (!regionProgress.isUnlocked) {
            regionProgress.isUnlocked = true;
            regionProgress.firstEnteredAt = new Date();
        }

        // Recalculate region stats
        const allQuestProgress = userProgress.questProgress.filter(
            qp => qp.regionId?.toString() === quest.region.toString()
        );

        regionProgress.totalStars = allQuestProgress.reduce((sum, qp) => sum + qp.stars, 0);
        regionProgress.questsCompleted = allQuestProgress.filter(qp => qp.isCompleted).length;

        // Check if region is complete
        const totalQuestsInRegion = await Quest.countDocuments({
            region: quest.region,
            status: "active"
        });

        regionProgress.totalQuests = totalQuestsInRegion;

        if (regionProgress.questsCompleted >= totalQuestsInRegion && !regionProgress.isCompleted) {
            regionProgress.isCompleted = true;
            regionProgress.completedAt = new Date();
            userProgress.regionsCompleted += 1;
        }

        // Update overall stats
        userProgress.totalStars = userProgress.regionProgress.reduce(
            (sum, rp) => sum + rp.totalStars, 0
        );
        userProgress.questsCompleted = userProgress.questProgress.filter(
            qp => qp.isCompleted
        ).length;
        userProgress.totalWorldMapXP += (stars > previousStars) ? xpEarned : 0;
        userProgress.lastActiveQuest = quest._id;
        userProgress.activeRegion = quest.region;

        await userProgress.save();

        // Update user XP (only for improvements)
        if (stars > previousStars) {
            const user = await User.findById(userId);
            if (user) {
                user.xp += xpEarned;
                user.level = calculateLevel(user.xp);
                user.tier = calculateTier(user.level);
                await user.save();
            }
        }

        res.json({
            success: true,
            stars,
            previousStars,
            xpEarned: (stars > previousStars) ? xpEarned : 0,
            isNewCompletion,
            questProgress: {
                isCompleted: questProgress.isCompleted,
                stars: questProgress.stars,
                bestScore: questProgress.bestScore,
                attempts: questProgress.attempts
            },
            regionProgress: {
                totalStars: regionProgress.totalStars,
                questsCompleted: regionProgress.questsCompleted,
                totalQuests: regionProgress.totalQuests,
                isCompleted: regionProgress.isCompleted
            }
        });
    } catch (error) {
        console.error("Complete quest error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get user's full progress
 */
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userProgress = await UserProgress.findOne({ userId })
            .populate("activeRegion", "name code icon")
            .populate("lastActiveQuest", "title order")
            .lean();

        if (!userProgress) {
            return res.json({
                totalStars: 0,
                regionsCompleted: 0,
                questsCompleted: 0,
                regionProgress: [],
                questProgress: []
            });
        }

        res.json(userProgress);
    } catch (error) {
        console.error("Get user progress error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Admin: Create a region
 */
exports.createRegion = async (req, res) => {
    try {
        const region = await Region.create(req.body);
        res.status(201).json(region);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Admin: Create a quest
 */
exports.createQuest = async (req, res) => {
    try {
        const quest = await Quest.create(req.body);

        // Update region stats
        const region = await Region.findById(quest.region);
        if (region) {
            const questCount = await Quest.countDocuments({ region: quest.region, status: "active" });
            const totalXP = await Quest.aggregate([
                { $match: { region: quest.region, status: "active" } },
                { $group: { _id: null, total: { $sum: "$xpReward" } } }
            ]);

            region.totalQuests = questCount;
            region.maxStars = questCount * 3;
            region.totalXP = totalXP[0]?.total || 0;
            await region.save();
        }

        res.status(201).json(quest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
