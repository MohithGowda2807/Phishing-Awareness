const express = require("express");
const router = express.Router();
const cognitiveBiasController = require("../controllers/cognitiveBias.controller");
const { authenticate } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Get all cognitive biases
router.get("/", cognitiveBiasController.getAllBiases);

// Get user's progress
router.get("/progress", cognitiveBiasController.getUserProgress);

// Reset all progress
router.delete("/progress", cognitiveBiasController.resetProgress);

// Reset specific bias progress
router.delete("/progress/:biasId", cognitiveBiasController.resetProgress);

// Get bias details
router.get("/:biasId", cognitiveBiasController.getBiasDetails);

// Get exercise
router.get("/:biasId/exercise/:exerciseIndex", cognitiveBiasController.getExercise);

// Submit exercise answer
router.post("/:biasId/exercise/:exerciseIndex/answer", cognitiveBiasController.submitExerciseAnswer);

module.exports = router;
