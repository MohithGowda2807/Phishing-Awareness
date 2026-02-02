const express = require("express");
const router = express.Router();
const localeController = require("../controllers/locale.controller");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get localized scenarios
router.get("/scenarios", localeController.getLocalizedScenarios);

// Get random scenario for training
router.get("/scenarios/random", localeController.getRandomScenario);

// Submit scenario answer
router.post("/scenarios/:scenarioId/answer", localeController.submitScenarioAnswer);

// Get available categories
router.get("/categories", localeController.getCategories);

// Update user's locale preference
router.put("/preference", localeController.updateLocale);

// Get locale-specific stats
router.get("/stats", localeController.getLocaleStats);

module.exports = router;
