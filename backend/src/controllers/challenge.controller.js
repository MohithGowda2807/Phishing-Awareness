const Challenge = require("../models/Challenge");
const User = require("../models/User");

// Create a new challenge
exports.createChallenge = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Check eligibility (must have completed at least 5 missions)
        if (!user || user.missionsCompleted < 5) {
            return res.status(403).json({
                message: "You must complete at least 5 missions to create challenges"
            });
        }

        const {
            title,
            type,
            difficulty,
            category,
            emailContent,
            clues,
            explanation
        } = req.body;

        // Validation
        if (!title || !type || !difficulty || !category || !emailContent || !clues?.length) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const challenge = await Challenge.create({
            creator: userId,
            title,
            type,
            difficulty,
            category,
            emailContent,
            clues,
            explanation,
            status: "pending"
        });

        res.status(201).json(challenge);

    } catch (error) {
        console.error("Create challenge error:", error);
        res.status(500).json({ message: "Failed to create challenge" });
    }
};

// Get all approved/featured challenges
exports.getChallenges = async (req, res) => {
    try {
        const { category, sort = "popular", page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { status: { $in: ["approved", "featured"] } };
        if (category && category !== "all") {
            query.category = category;
        }

        let sortOption = { upvotes: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };
        if (sort === "difficulty") sortOption = { difficulty: 1 };

        const challenges = await Challenge.find(query)
            .populate("creator", "username level tier")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Challenge.countDocuments(query);

        res.json({
            challenges,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Get challenges error:", error);
        res.status(500).json({ message: "Failed to load challenges" });
    }
};

// Get single challenge
exports.getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate("creator", "username level tier badges");

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        res.json(challenge);

    } catch (error) {
        res.status(500).json({ message: "Failed to load challenge" });
    }
};

// Vote on a challenge
exports.voteChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const { vote } = req.body; // "up" or "down"
        const userId = req.user.id;

        if (!["up", "down"].includes(vote)) {
            return res.status(400).json({ message: "Invalid vote type" });
        }

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        // Check if user already voted
        const existingVote = challenge.voters.find(
            v => v.user.toString() === userId
        );

        if (existingVote) {
            if (existingVote.vote === vote) {
                // Remove vote (toggle off)
                challenge.voters = challenge.voters.filter(
                    v => v.user.toString() !== userId
                );
                if (vote === "up") challenge.upvotes--;
                else challenge.downvotes--;
            } else {
                // Change vote
                existingVote.vote = vote;
                if (vote === "up") {
                    challenge.upvotes++;
                    challenge.downvotes--;
                } else {
                    challenge.downvotes++;
                    challenge.upvotes--;
                }
            }
        } else {
            // New vote
            challenge.voters.push({ user: userId, vote });
            if (vote === "up") challenge.upvotes++;
            else challenge.downvotes++;
        }

        await challenge.save();

        res.json({
            upvotes: challenge.upvotes,
            downvotes: challenge.downvotes,
            userVote: challenge.voters.find(v => v.user.toString() === userId)?.vote || null
        });

    } catch (error) {
        console.error("Vote error:", error);
        res.status(500).json({ message: "Failed to vote" });
    }
};

// Get user's created challenges
exports.getMyChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({ creator: req.user.id })
            .sort({ createdAt: -1 });

        res.json(challenges);

    } catch (error) {
        res.status(500).json({ message: "Failed to load your challenges" });
    }
};

// Submit challenge answer (play a community challenge)
exports.submitChallengeAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { verdict, cluesFound } = req.body;
        const userId = req.user.id;

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        const isPhishing = challenge.type === "phishing";
        const correct = verdict === isPhishing;

        // Calculate score
        const clueAccuracy = challenge.clues.length > 0
            ? (cluesFound?.filter(c => challenge.clues.includes(c)).length || 0) / challenge.clues.length
            : 1;

        let score = correct ? 50 : 20;
        score += Math.round(clueAccuracy * 30);
        score = Math.min(100, Math.max(0, score));

        // Update challenge stats
        challenge.timesPlayed++;
        challenge.totalScore += score;
        challenge.avgScore = Math.round(challenge.totalScore / challenge.timesPlayed);
        await challenge.save();

        // Award XP to user
        const user = await User.findById(userId);
        if (user) {
            const xpGained = Math.round(score * 0.3);
            user.xp += xpGained;
            user.level = Math.floor(user.xp / 500) + 1;
            await user.save();
        }

        res.json({
            correct,
            score,
            wasPhishing: isPhishing,
            clues: challenge.clues,
            explanation: challenge.explanation,
            xpGained: Math.round(score * 0.3)
        });

    } catch (error) {
        console.error("Submit challenge error:", error);
        res.status(500).json({ message: "Failed to submit answer" });
    }
};

// Moderation: Get pending challenges (admin/mod only)
exports.getPendingChallenges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !["admin", "moderator"].includes(user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const challenges = await Challenge.find({ status: "pending" })
            .populate("creator", "username level")
            .sort({ createdAt: 1 });

        res.json(challenges);

    } catch (error) {
        res.status(500).json({ message: "Failed to load pending challenges" });
    }
};

// Moderation: Approve/reject challenge
exports.moderateChallenge = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !["admin", "moderator"].includes(user.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { id } = req.params;
        const { action, note } = req.body; // action: "approve", "reject", "feature"

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        if (action === "approve") {
            challenge.status = "approved";
        } else if (action === "reject") {
            challenge.status = "rejected";
        } else if (action === "feature") {
            challenge.status = "featured";
        }

        challenge.moderatedBy = req.user.id;
        challenge.moderationNote = note || "";
        await challenge.save();

        res.json({ message: `Challenge ${action}d successfully`, challenge });

    } catch (error) {
        res.status(500).json({ message: "Failed to moderate challenge" });
    }
};
