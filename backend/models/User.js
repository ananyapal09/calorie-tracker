const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    calorieGoal: {
      type: Number,
      default: 2000,
    },

    macroGoals: {
      protein: {
        type: Number,
        default: 100,
      },
      carbs: {
        type: Number,
        default: 250,
      },
      fats: {
        type: Number,
        default: 65,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);