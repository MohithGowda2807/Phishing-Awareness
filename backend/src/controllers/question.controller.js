const Question = require("../models/Question");
const User = require("../models/User");
const { scoreQuestion, generateFeedback } = require("../utils/scoring");
const { calculateXP, calculateLevel, calculateTier } = require("../utils/gamification");

/**
 * Get all published questions
 */
exports.getQuestions = async (req, res) => {
    try {
        const { contentType, difficulty, topic, status = 'published' } = req.query;

        const filter = { status };

        if (contentType) filter.contentType = contentType;
        if (difficulty) filter['tags.difficulty'] = parseInt(difficulty);
        if (topic) filter['tags.topic'] = topic;

        const questions = await Question.find(filter)
            .select('-answers.isCorrect -answers.weight')  // Hide correct answers
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single question by ID
 */
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .select('-answers.isCorrect -answers.weight');  // Hide correct answers

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new question (admin only)
 */
exports.createQuestion = async (req, res) => {
    try {
        const questionData = req.body;

        // Validate that at least one answer is correct
        const hasCorrect = questionData.answers?.some(a => a.isCorrect);
        if (!hasCorrect) {
            return res.status(400).json({ message: "Question must have at least one correct answer" });
        }

        // Generate unique IDs for answers if not provided
        if (questionData.answers) {
            questionData.answers = questionData.answers.map((a, i) => ({
                ...a,
                id: a.id || `ans_${Date.now()}_${i}`
            }));
        }

        const question = await Question.create(questionData);
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a question (admin only)
 */
exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a question (admin only)
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({ message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Submit answer(s) to a question
 */
exports.submitAnswer = async (req, res) => {
    try {
        const { userId, selectedAnswers, timeSpent } = req.body;
        const questionId = req.params.id;

        // Validate input
        if (!selectedAnswers || (Array.isArray(selectedAnswers) && selectedAnswers.length === 0)) {
            return res.status(400).json({ message: "No answers selected" });
        }

        // Get question with full answer data
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Validate answer selection
        const validation = question.validateAnswers(
            Array.isArray(selectedAnswers) ? selectedAnswers : [selectedAnswers]
        );
        if (!validation.valid) {
            return res.status(400).json({ message: validation.error });
        }

        // Calculate score
        const scoreResult = scoreQuestion(question, selectedAnswers, {
            wrongPenalty: 0,
            penaltyFactor: 0.5,
            perfectBonus: 1.1
        });

        // Generate feedback
        const feedback = generateFeedback(scoreResult, question);

        // Update user stats if userId provided
        let userUpdate = null;
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                // Calculate XP
                const xpGained = calculateXP(scoreResult.score, question.tags?.difficulty || 3, user.streak);
                const newXP = user.xp + xpGained;
                const newLevel = calculateLevel(newXP);
                const newTier = calculateTier(newLevel);

                // Update user
                user.xp = newXP;
                user.level = newLevel;
                user.tier = newTier;
                user.weeklyXP += xpGained;
                user.totalDecisions += 1;

                if (scoreResult.isCorrect || scoreResult.isPartiallyCorrect) {
                    user.correctDecisions += 1;
                }

                await user.save();

                userUpdate = {
                    xpGained,
                    newLevel,
                    newTier,
                    totalXP: newXP
                };
            }
        }

        // Update question stats
        const totalAnswers = question.timesAnswered + 1;
        const newAvgScore = (question.averageScore * question.timesAnswered + scoreResult.score) / totalAnswers;

        await Question.findByIdAndUpdate(questionId, {
            timesAnswered: totalAnswers,
            averageScore: Math.round(newAvgScore * 10) / 10
        });

        // Build response
        const response = {
            score: scoreResult.score,
            maxPoints: question.maxPoints,
            percentage: Math.round((scoreResult.score / question.maxPoints) * 100),
            feedback,
            explanation: question.explanation,
            clues: question.clues,

            // Scoring details
            scoring: {
                isOptimal: scoreResult.isOptimal,
                isCorrect: scoreResult.isCorrect,
                isPerfect: scoreResult.isPerfect,
                breakdown: scoreResult.breakdown
            },

            // Reveal correct answers
            correctAnswers: question.answers.filter(a => a.isCorrect).map(a => ({
                id: a.id,
                label: a.label,
                code: a.code,
                weight: a.weight
            })),

            // User's selections
            selectedAnswers: Array.isArray(selectedAnswers) ? selectedAnswers : [selectedAnswers],

            // User update if applicable
            userUpdate
        };

        res.json(response);

    } catch (error) {
        console.error("Submit answer error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get question statistics (admin)
 */
exports.getQuestionStats = async (req, res) => {
    try {
        const stats = await Question.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: null,
                    totalQuestions: { $sum: 1 },
                    avgDifficulty: { $avg: '$tags.difficulty' },
                    totalAnswered: { $sum: '$timesAnswered' },
                    avgScore: { $avg: '$averageScore' }
                }
            }
        ]);

        const byContentType = await Question.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$contentType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            overall: stats[0] || {},
            byContentType
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
