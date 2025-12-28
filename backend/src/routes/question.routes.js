const express = require("express");
const router = express.Router();
const {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    submitAnswer,
    getQuestionStats
} = require("../controllers/question.controller");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// Public routes (still hide correct answers in controller)
router.get("/", getQuestions);
router.get("/stats", getQuestionStats);
router.get("/:id", getQuestionById);

// Submit answer (authenticated)
router.post("/:id/submit", authenticate, submitAnswer);

// Admin routes
router.post("/", authenticate, requireAdmin, createQuestion);
router.put("/:id", authenticate, requireAdmin, updateQuestion);
router.delete("/:id", authenticate, requireAdmin, deleteQuestion);

module.exports = router;
