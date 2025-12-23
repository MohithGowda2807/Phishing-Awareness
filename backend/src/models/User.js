const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    badges: {
  type: [String],
  default: []
},
missionsCompleted: {
  type: Number,
  default: 0
},

correctDecisions: { type: Number, default: 0 },
totalDecisions: { type: Number, default: 0 },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    

    // 🔥 For gamification (future phases)
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
