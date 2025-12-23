const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true
    },

    verdict: {
      type: Boolean,
      required: true
    },

    selectedClues: {
      type: [String],
      default: []
    },

    score: {
      type: Number,
      required: true
    },

    feedback: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
