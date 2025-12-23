const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    ranger: {
      name: String,
      department: String
    },

    helpRequest: {
      type: String,
      required: true
    },

    emailBody: {
      type: String,
      required: true
    },

    emailHeaders: {
      from: String,
      to: String,
      spf: String,
      dkim: String,
      dmarc: String,
      returnPath: String
    },

    isPhishing: {
      type: Boolean,
      required: true
    },

    clues: {
      type: [String],
      required: true
    },

    scoreWeight: {
      type: Number,
      default: 50
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mission", missionSchema);
