const Mission = require("../models/Mission");

// CREATE MISSION (admin for now)
exports.createMission = async (req, res) => {
  try {
    const mission = await Mission.create(req.body);
    res.status(201).json(mission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL MISSIONS
exports.getMissions = async (req, res) => {
  try {
    const missions = await Mission.find({ status: "published" });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE MISSION
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
