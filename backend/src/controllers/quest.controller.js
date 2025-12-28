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

            // First region is always unlocked
            let isUnlocked = index === 0;

            if (!isUnlocked) {
                // Check previous region completion
                const prevRegion = regions[index - 1];
                if (prevRegion && userProgress) {
                    const prevProgress = userProgress.regionProgress?.find(
                        rp => rp.regionId?.toString() === prevRegion._id.toString()
                    );

                    // Unlock if previous region is completed OR has enough stars
                    if (prevProgress) {
                        const hasEnoughStars = prevProgress.totalStars >= (region.requiredStarsFromPrevious || 0);
                        isUnlocked = prevProgress.isCompleted || hasEnoughStars;
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

/**
 * Admin: Seed initial regions and quests (one-time setup)
 * This is additive - won't delete existing data
 */
exports.seedRegions = async (req, res) => {
    try {
        // Check if regions already exist
        const existingCount = await Region.countDocuments();
        if (existingCount > 0) {
            return res.json({
                message: `World Map already has ${existingCount} regions. Seed skipped.`,
                alreadySeeded: true,
                regionCount: existingCount
            });
        }

        // Create regions
        const regionsData = [
            {
                name: "Phishing Detection",
                code: "PHISHING",
                description: "Learn to identify and report phishing emails, messages, and websites.",
                icon: "📧",
                color: "emerald",
                order: 1,
                requiredLevel: 1,
                story: {
                    intro: "Welcome, Defender! The Cyber Syndicate has launched a massive phishing campaign. Your mission: learn to spot their deceptive emails.",
                    completion: "Excellent work! You've mastered phishing detection."
                },
                status: "active"
            },
            {
                name: "Password Security",
                code: "PASSWORDS",
                description: "Understand password strength, safe practices, and multi-factor authentication.",
                icon: "🔒",
                color: "blue",
                order: 2,
                requiredLevel: 2,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "The Syndicate is attempting brute-force attacks. Time to learn about unbreakable passwords.",
                    completion: "Your password knowledge is now fortress-level."
                },
                status: "active"
            },
            {
                name: "Web & URL Safety",
                code: "WEB_SAFETY",
                description: "Detect malicious links, typosquatting, and dangerous websites.",
                icon: "🔗",
                color: "purple",
                order: 3,
                requiredLevel: 3,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "The Syndicate has set up fake websites. Learn to spot the imposters!",
                    completion: "You can now see through even the most convincing fake URLs."
                },
                status: "active"
            },
            {
                name: "Malware Awareness",
                code: "MALWARE",
                description: "Recognize malware delivery methods, suspicious attachments, and ransomware.",
                icon: "🦠",
                color: "red",
                order: 4,
                requiredLevel: 4,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "Intelligence suggests a ransomware attack is planned. Learn to identify malware!",
                    completion: "You're now a malware detection expert."
                },
                status: "active"
            },
            {
                name: "Social Engineering",
                code: "SOCIAL_ENGINEERING",
                description: "Defend against pretexting, vishing, and psychological manipulation.",
                icon: "🎭",
                color: "orange",
                order: 5,
                requiredLevel: 5,
                requiredStarsFromPrevious: 6,
                story: {
                    intro: "The Syndicate's agents use psychology. Learn to resist manipulation!",
                    completion: "No social engineering can fool you now."
                },
                status: "active"
            },
            {
                name: "Final Challenge",
                code: "BOSS_CHALLENGE",
                description: "Face a multi-vector attack combining all your skills.",
                icon: "🚨",
                color: "yellow",
                order: 6,
                requiredLevel: 6,
                requiredStarsFromPrevious: 9,
                story: {
                    intro: "This is it! The Syndicate's ultimate attack combining everything. Stop them!",
                    completion: "🏆 CONGRATULATIONS! You've defeated the Cyber Syndicate!"
                },
                status: "active"
            }
        ];

        const regions = await Region.insertMany(regionsData);

        // Create quests for Phishing region
        const phishingRegion = regions.find(r => r.code === "PHISHING");

        const questsData = [
            {
                region: phishingRegion._id,
                title: "Spot the Fake Sender",
                description: "Learn to identify spoofed email addresses.",
                order: 1,
                questType: "tutorial",
                difficulty: 1,
                xpReward: 50,
                bonusXP: 15,
                requiredStars: 0,
                icon: "👤",
                story: { intro: "Phishing emails often impersonate trusted senders. Let's learn to spot the fakes." },
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Link Inspection 101",
                description: "Master the art of hovering before clicking.",
                order: 2,
                questType: "mission",
                difficulty: 2,
                xpReward: 60,
                bonusXP: 20,
                requiredStars: 2,
                icon: "🔗",
                story: { intro: "Never click a link without checking where it really goes!" },
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Urgency Red Flags",
                description: "Recognize high-pressure tactics.",
                order: 3,
                questType: "question",
                difficulty: 2,
                xpReward: 70,
                bonusXP: 20,
                requiredStars: 4,
                icon: "⏰",
                story: { intro: "Attackers love to create panic. Stay calm!" },
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "CEO Impersonation",
                description: "Defend against BEC attacks.",
                order: 4,
                questType: "mission",
                difficulty: 3,
                xpReward: 80,
                bonusXP: 25,
                requiredStars: 6,
                icon: "👔",
                story: { intro: "The Syndicate is impersonating executives. Can you spot them?" },
                status: "active"
            },
            {
                region: phishingRegion._id,
                title: "Phishing Boss: BEC Attack",
                description: "Face a multi-stage Business Email Compromise.",
                order: 5,
                questType: "boss",
                difficulty: 4,
                xpReward: 150,
                bonusXP: 50,
                requiredStars: 9,
                starThresholds: { one: 60, two: 80, three: 95 },
                icon: "🏆",
                isBoss: true,
                story: { intro: "The ultimate phishing test. A sophisticated BEC attack unfolds!" },
                status: "active"
            }
        ];

        const quests = await Quest.insertMany(questsData);

        // Update region stats
        phishingRegion.totalQuests = quests.length;
        phishingRegion.maxStars = quests.length * 3;
        phishingRegion.totalXP = quests.reduce((sum, q) => sum + q.xpReward, 0);
        await phishingRegion.save();

        res.json({
            success: true,
            message: "World Map seeded successfully!",
            regionsCreated: regions.length,
            questsCreated: quests.length
        });
    } catch (error) {
        console.error("Seed regions error:", error);
        res.status(500).json({ error: error.message });
    }
};
