const CognitiveBias = require("../models/CognitiveBias");
const User = require("../models/User");

/**
 * Cognitive Bias Controller
 * Handles cognitive bias training module
 */

// Get all cognitive biases for training
exports.getAllBiases = async (req, res) => {
    try {
        const biases = await CognitiveBias.getAllActive();
        const userId = req.user._id;

        // Get user's progress
        const user = await User.findById(userId).select("biasTrainingProgress");
        const completedBiases = user?.biasTrainingProgress?.completedBiases || [];

        // Add completion status to each bias
        const biasesWithProgress = biases.map(bias => ({
            biasId: bias.biasId,
            name: bias.name,
            icon: bias.icon,
            shortDescription: bias.shortDescription,
            exerciseCount: bias.exercises.length,
            order: bias.order,
            isCompleted: completedBiases.includes(bias.biasId),
            stats: bias.stats
        }));

        res.json({
            biases: biasesWithProgress,
            userProgress: {
                completedCount: completedBiases.length,
                totalCount: biases.length,
                overallScore: user?.biasTrainingProgress?.overallScore || 0
            }
        });
    } catch (error) {
        console.error("Error fetching biases:", error);
        res.status(500).json({ message: "Failed to fetch cognitive biases" });
    }
};

// Get single bias details with exercises
exports.getBiasDetails = async (req, res) => {
    try {
        const { biasId } = req.params;

        const bias = await CognitiveBias.findOne({ biasId, isActive: true });
        if (!bias) {
            return res.status(404).json({ message: "Bias not found" });
        }

        // Get user's progress for this bias
        const user = await User.findById(req.user._id).select("biasTrainingProgress");
        const isCompleted = user?.biasTrainingProgress?.completedBiases?.includes(biasId);

        res.json({
            bias: {
                biasId: bias.biasId,
                name: bias.name,
                icon: bias.icon,
                shortDescription: bias.shortDescription,
                detailedExplanation: bias.detailedExplanation,
                attackerExploitation: bias.attackerExploitation,
                examples: bias.examples,
                defenseStrategies: bias.defenseStrategies,
                exerciseCount: bias.exercises.length,
                references: bias.references,
                stats: bias.stats
            },
            isCompleted
        });
    } catch (error) {
        console.error("Error fetching bias details:", error);
        res.status(500).json({ message: "Failed to fetch bias details" });
    }
};

// Get exercise for a bias
exports.getExercise = async (req, res) => {
    try {
        const { biasId, exerciseIndex } = req.params;
        const index = parseInt(exerciseIndex);

        const bias = await CognitiveBias.findOne({ biasId, isActive: true });
        if (!bias) {
            return res.status(404).json({ message: "Bias not found" });
        }

        if (index < 0 || index >= bias.exercises.length) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        const exercise = bias.exercises[index];

        // Send exercise without correct answers
        res.json({
            biasId: bias.biasId,
            biasName: bias.name,
            exerciseIndex: index,
            totalExercises: bias.exercises.length,
            exercise: {
                type: exercise.type,
                prompt: exercise.prompt,
                scenario: exercise.scenario,
                options: exercise.options.map(opt => ({
                    text: opt.text
                    // Don't send isCorrect
                })),
                difficulty: exercise.difficulty,
                xpReward: exercise.xpReward
            }
        });
    } catch (error) {
        console.error("Error fetching exercise:", error);
        res.status(500).json({ message: "Failed to fetch exercise" });
    }
};

// Submit exercise answer
exports.submitExerciseAnswer = async (req, res) => {
    try {
        const { biasId, exerciseIndex } = req.params;
        const { selectedOption } = req.body;  // Index of selected option
        const userId = req.user._id;
        const index = parseInt(exerciseIndex);

        const bias = await CognitiveBias.findOne({ biasId, isActive: true });
        if (!bias) {
            return res.status(404).json({ message: "Bias not found" });
        }

        if (index < 0 || index >= bias.exercises.length) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        const exercise = bias.exercises[index];
        const selectedOptionData = exercise.options[selectedOption];

        if (!selectedOptionData) {
            return res.status(400).json({ message: "Invalid option selected" });
        }

        const isCorrect = selectedOptionData.isCorrect;
        let xpEarned = 0;

        // Update user progress
        if (isCorrect) {
            xpEarned = exercise.xpReward;
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    xp: xpEarned,
                    "biasTrainingProgress.exercisesCompleted": 1
                }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $inc: { "biasTrainingProgress.exercisesCompleted": 1 }
            });
        }

        // Check if this was the last exercise
        const isLastExercise = index === bias.exercises.length - 1;
        let biasCompleted = false;

        if (isLastExercise) {
            // Mark bias as completed
            await User.findByIdAndUpdate(userId, {
                $addToSet: { "biasTrainingProgress.completedBiases": biasId }
            });
            biasCompleted = true;

            // Update bias stats
            await bias.updateStats(isCorrect ? 100 : 0);
        }

        res.json({
            isCorrect,
            xpEarned,
            explanation: exercise.explanation,
            correctOption: exercise.options.findIndex(opt => opt.isCorrect),
            optionExplanation: selectedOptionData.explanation,
            isLastExercise,
            biasCompleted
        });
    } catch (error) {
        console.error("Error submitting exercise answer:", error);
        res.status(500).json({ message: "Failed to submit answer" });
    }
};

// Get user's bias training progress
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("biasTrainingProgress xp");
        const allBiases = await CognitiveBias.find({ isActive: true }).select("biasId name");

        const completedBiases = user?.biasTrainingProgress?.completedBiases || [];

        res.json({
            completedBiases,
            totalBiases: allBiases.length,
            completionPercentage: Math.round((completedBiases.length / allBiases.length) * 100),
            exercisesCompleted: user?.biasTrainingProgress?.exercisesCompleted || 0,
            overallScore: user?.biasTrainingProgress?.overallScore || 0
        });
    } catch (error) {
        console.error("Error fetching user progress:", error);
        res.status(500).json({ message: "Failed to fetch progress" });
    }
};

// Reset user's bias training progress (for retake)
exports.resetProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { biasId } = req.params;

        if (biasId) {
            // Reset specific bias
            await User.findByIdAndUpdate(userId, {
                $pull: { "biasTrainingProgress.completedBiases": biasId }
            });
        } else {
            // Reset all
            await User.findByIdAndUpdate(userId, {
                "biasTrainingProgress.completedBiases": [],
                "biasTrainingProgress.overallScore": 0,
                "biasTrainingProgress.exercisesCompleted": 0
            });
        }

        res.json({ message: "Progress reset successfully" });
    } catch (error) {
        console.error("Error resetting progress:", error);
        res.status(500).json({ message: "Failed to reset progress" });
    }
};
