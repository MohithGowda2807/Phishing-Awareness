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

    // Mission type for multi-vector training
    type: {
      type: String,
      enum: ["email", "sms", "qrcode", "voice"],
      default: "email"
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

    // Attachments for realistic simulation
    attachments: [{
      name: String,
      type: String,
      suspicious: Boolean
    }],

    // Links with hover preview data
    links: [{
      displayText: String,
      actualUrl: String,
      suspicious: Boolean
    }],

    isPhishing: {
      type: Boolean,
      required: true
    },

    clues: {
      type: [String],
      required: true
    },

    // Learning content shown after mission
    explanation: {
      type: String
    },

    scoreWeight: {
      type: Number,
      default: 50
    },

    // Weekly challenge association
    weeklyChallenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge"
    },

    // Categories for filtering
    categories: [{
      type: String,
      enum: ["financial", "account", "shipping", "prize", "urgency", "internal", "external"]
    }],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published"
    },

    // Stats
    timesCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mission", missionSchema);
