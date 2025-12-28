const mongoose = require("mongoose");
const { CONTENT_TYPES, QUESTION_TYPES } = require("../constants/taxonomy");

/**
 * Question Schema
 * 
 * Supports multiple correct labels with weighted scoring.
 * Each answer can have a weight (0-1) for partial credit.
 */
const answerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true  // Internal taxonomy code (e.g., PHISHING_SPEAR)
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number,
        default: 1.0,
        min: 0,
        max: 1
    },
    category: {
        type: String  // e.g., 'phishing', 'malware', 'benign'
    }
}, { _id: false });

const questionSchema = new mongoose.Schema(
    {
        // Question prompt/title
        prompt: {
            type: String,
            required: true
        },

        // Content type determines what content fields are used
        contentType: {
            type: String,
            enum: CONTENT_TYPES,
            required: true
        },

        // Scoring
        maxPoints: {
            type: Number,
            default: 100
        },

        // Tags for filtering and difficulty
        tags: {
            difficulty: {
                type: Number,
                min: 1,
                max: 5,
                default: 3
            },
            topic: [{
                type: String
            }]
        },

        // Attempt limits
        allowedAttempts: {
            type: Number,
            default: 1
        },

        // Question type: single-best or multi-select
        questionType: {
            type: String,
            enum: Object.values(QUESTION_TYPES),
            default: QUESTION_TYPES.SINGLE
        },

        // Weighted answers array
        answers: {
            type: [answerSchema],
            validate: {
                validator: function (answers) {
                    return answers && answers.length >= 2;
                },
                message: 'Question must have at least 2 answers'
            }
        },

        // Channel vectors (multi-select tags)
        channelVectors: [{
            type: String
        }],

        // Content for display based on contentType
        content: {
            // Email content
            emailBody: String,
            emailHeaders: {
                from: String,
                fromName: String,
                to: String,
                subject: String,
                spf: { type: String, default: 'none' },
                dkim: { type: String, default: 'none' },
                dmarc: { type: String, default: 'none' },
                returnPath: String
            },

            // SMS content
            smsBody: String,
            smsFrom: String,

            // URL content
            urlToAnalyze: String,
            urlScreenshot: String,

            // Voice content
            voiceTranscript: String,
            voiceCallerInfo: String,

            // Social media content
            socialPlatform: String,
            socialMessage: String,
            socialProfile: String,

            // QR code content
            qrImageUrl: String,
            qrDecodedUrl: String
        },

        // Explanation shown after answering
        explanation: {
            type: String
        },

        // Red flags/clues for learning
        clues: [{
            type: String
        }],

        // Status
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'published'
        },

        // Creator (for community questions)
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Stats
        timesAnswered: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        correctRate: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// Index for efficient queries
questionSchema.index({ status: 1, 'tags.difficulty': 1 });
questionSchema.index({ contentType: 1 });
questionSchema.index({ 'tags.topic': 1 });

// Virtual to get only correct answers
questionSchema.virtual('correctAnswers').get(function () {
    return this.answers.filter(a => a.isCorrect);
});

// Virtual to get best answer (highest weight correct)
questionSchema.virtual('bestAnswer').get(function () {
    const correct = this.answers.filter(a => a.isCorrect);
    return correct.reduce((best, a) => (a.weight > best.weight ? a : best), { weight: 0 });
});

// Method to check if answer selection is valid
questionSchema.methods.validateAnswers = function (selectedIds) {
    if (!selectedIds || selectedIds.length === 0) {
        return { valid: false, error: 'No answers selected' };
    }

    if (this.questionType === QUESTION_TYPES.SINGLE && selectedIds.length > 1) {
        return { valid: false, error: 'Single-answer question allows only one selection' };
    }

    const validIds = this.answers.map(a => a.id);
    const invalidIds = selectedIds.filter(id => !validIds.includes(id));

    if (invalidIds.length > 0) {
        return { valid: false, error: `Invalid answer IDs: ${invalidIds.join(', ')}` };
    }

    return { valid: true };
};

module.exports = mongoose.model("Question", questionSchema);
