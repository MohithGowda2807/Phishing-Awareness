const express = require("express");
const router = express.Router();
const cognitiveBiasController = require("../controllers/cognitiveBias.controller");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all cognitive biases
router.get("/", cognitiveBiasController.getAllBiases);

// Get user's progress
router.get("/progress", cognitiveBiasController.getUserProgress);

// Reset progress (all or specific bias)
router.delete("/progress/:biasId?", cognitiveBiasController.resetProgress);

// Get bias details
router.get("/:biasId", cognitiveBiasController.getBiasDetails);

// Get exercise
router.get("/:biasId/exercise/:exerciseIndex", cognitiveBiasController.getExercise);

// Submit exercise answer
router.post("/:biasId/exercise/:exerciseIndex/answer", cognitiveBiasController.submitExerciseAnswer);

module.exports = router;
