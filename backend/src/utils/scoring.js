/**
 * Scoring Utility for Questions
 * 
 * Transparent scoring logic for single-best and multi-select questions.
 * Supports weighted partial credit.
 */

const { QUESTION_TYPES } = require("../constants/taxonomy");

/**
 * Score a single-best-answer question
 * 
 * Rules:
 * - Highest-weight correct option → full points
 * - Lower-weight correct option → maxPoints * weight
 * - Wrong option → 0 (no penalty by default)
 * 
 * @param {Object} question - Question document
 * @param {String} selectedAnswerId - Selected answer ID
 * @param {Number} wrongPenalty - Optional penalty for wrong answer (0-1)
 * @returns {Object} { score, isOptimal, isCorrect, breakdown, selectedAnswer, bestAnswer }
 */
function scoreSingleAnswer(question, selectedAnswerId, wrongPenalty = 0) {
    const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);

    if (!selectedAnswer) {
        return {
            score: 0,
            isOptimal: false,
            isCorrect: false,
            breakdown: 'Invalid answer selected',
            selectedAnswer: null,
            bestAnswer: null
        };
    }

    // Find the best (highest weight) correct answer
    const correctAnswers = question.answers.filter(a => a.isCorrect);
    const bestAnswer = correctAnswers.reduce(
        (best, a) => (a.weight > best.weight ? a : best),
        { weight: 0, id: null }
    );

    // Wrong answer
    if (!selectedAnswer.isCorrect) {
        const penalty = Math.round(question.maxPoints * wrongPenalty);
        return {
            score: Math.max(0, -penalty),
            isOptimal: false,
            isCorrect: false,
            breakdown: wrongPenalty > 0
                ? `Incorrect answer selected. Penalty: -${penalty} points`
                : 'Incorrect answer selected',
            selectedAnswer,
            bestAnswer
        };
    }

    // Correct answer - calculate weighted score
    const score = Math.round(question.maxPoints * selectedAnswer.weight);
    const isOptimal = selectedAnswer.id === bestAnswer.id;

    return {
        score,
        isOptimal,
        isCorrect: true,
        breakdown: isOptimal
            ? `Best answer selected - full ${score} points!`
            : `Correct answer! ${Math.round(selectedAnswer.weight * 100)}% credit (${score}/${question.maxPoints} points). The optimal answer was "${bestAnswer.label}".`,
        selectedAnswer,
        bestAnswer
    };
}

/**
 * Score a multi-select question
 * 
 * Rules:
 * - Score = maxPoints * (sum of correct weights / total correct weights - wrong penalty)
 * - +10% bonus if all and only correct options selected
 * - Minimum score is 0
 * 
 * @param {Object} question - Question document
 * @param {Array<String>} selectedAnswerIds - Array of selected answer IDs
 * @param {Number} penaltyFactor - Penalty per wrong selection (default 0.5)
 * @param {Number} perfectBonus - Bonus multiplier for perfect selection (default 1.1 = 10%)
 * @returns {Object} Scoring result with breakdown
 */
function scoreMultiAnswer(question, selectedAnswerIds, penaltyFactor = 0.5, perfectBonus = 1.1) {
    const correctAnswers = question.answers.filter(a => a.isCorrect);

    if (correctAnswers.length === 0) {
        return {
            score: 0,
            isPerfect: false,
            breakdown: {
                error: 'Question has no correct answers defined'
            }
        };
    }

    // Calculate total weight of all correct answers
    const totalCorrectWeight = correctAnswers.reduce((sum, a) => sum + a.weight, 0);

    let earnedWeight = 0;
    let wrongCount = 0;
    const selectedCorrect = [];
    const selectedWrong = [];
    const missedCorrect = [];

    // Process selected answers
    selectedAnswerIds.forEach(id => {
        const answer = question.answers.find(a => a.id === id);
        if (!answer) return;

        if (answer.isCorrect) {
            earnedWeight += answer.weight;
            selectedCorrect.push(answer);
        } else {
            wrongCount++;
            selectedWrong.push(answer);
        }
    });

    // Find missed correct answers
    correctAnswers.forEach(a => {
        if (!selectedAnswerIds.includes(a.id)) {
            missedCorrect.push(a);
        }
    });

    // Check for perfect selection (all correct and only correct)
    const isPerfect =
        selectedCorrect.length === correctAnswers.length &&
        selectedWrong.length === 0;

    // Calculate raw score
    let scoreRatio = earnedWeight / totalCorrectWeight;
    scoreRatio -= wrongCount * penaltyFactor / correctAnswers.length;

    // Apply perfect bonus
    if (isPerfect) {
        scoreRatio *= perfectBonus;
    }

    // Clamp and round
    const score = Math.max(0, Math.min(question.maxPoints, Math.round(scoreRatio * question.maxPoints)));

    return {
        score,
        isPerfect,
        isPartiallyCorrect: selectedCorrect.length > 0,
        breakdown: {
            earnedWeight: Math.round(earnedWeight * 100) / 100,
            totalCorrectWeight: Math.round(totalCorrectWeight * 100) / 100,
            correctSelected: selectedCorrect.length,
            totalCorrect: correctAnswers.length,
            wrongSelections: wrongCount,
            perfectBonus: isPerfect,
            penaltyApplied: wrongCount * penaltyFactor
        },
        selectedCorrect,
        selectedWrong,
        missedCorrect
    };
}

/**
 * Score a question based on its type
 * 
 * @param {Object} question - Question document
 * @param {String|Array<String>} selectedAnswers - Selected answer(s)
 * @param {Object} options - Scoring options
 * @returns {Object} Scoring result
 */
function scoreQuestion(question, selectedAnswers, options = {}) {
    const {
        wrongPenalty = 0,
        penaltyFactor = 0.5,
        perfectBonus = 1.1
    } = options;

    // Normalize to array
    const answerIds = Array.isArray(selectedAnswers) ? selectedAnswers : [selectedAnswers];

    if (question.questionType === QUESTION_TYPES.MULTI) {
        return scoreMultiAnswer(question, answerIds, penaltyFactor, perfectBonus);
    } else {
        // Single answer - take first selection
        return scoreSingleAnswer(question, answerIds[0], wrongPenalty);
    }
}

/**
 * Generate user-friendly feedback message
 * 
 * @param {Object} result - Scoring result
 * @param {Object} question - Question document
 * @returns {String} Feedback message
 */
function generateFeedback(result, question) {
    if (question.questionType === QUESTION_TYPES.SINGLE) {
        if (result.isOptimal) {
            return `🎯 Perfect! You identified the most specific threat classification.`;
        } else if (result.isCorrect) {
            return `✅ Correct, but there's a more specific answer. "${result.bestAnswer?.label}" would earn full points.`;
        } else {
            return `❌ Incorrect. The correct answer was "${result.bestAnswer?.label}".`;
        }
    } else {
        // Multi-select
        if (result.isPerfect) {
            return `🎯 Perfect! You identified all correct classifications without any false positives. +10% bonus applied!`;
        } else if (result.isPartiallyCorrect) {
            const { correctSelected, totalCorrect, wrongSelections } = result.breakdown;
            let msg = `✅ Partially correct. You got ${correctSelected}/${totalCorrect} correct answers.`;
            if (wrongSelections > 0) {
                msg += ` However, ${wrongSelections} wrong selection(s) reduced your score.`;
            }
            if (result.missedCorrect.length > 0) {
                msg += ` You missed: ${result.missedCorrect.map(a => a.label).join(', ')}.`;
            }
            return msg;
        } else {
            return `❌ Incorrect. None of your selections were correct.`;
        }
    }
}

module.exports = {
    scoreSingleAnswer,
    scoreMultiAnswer,
    scoreQuestion,
    generateFeedback
};
