const express = require("express");
const router = express.Router();
const missionController = require("../controllers/mission.controller");

router.post("/", missionController.createMission);
router.get("/", missionController.getMissions);
router.get("/:id", missionController.getMissionById);

module.exports = router;
