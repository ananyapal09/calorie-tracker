const express = require("express");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * GET USER PROFILE
 * GET /api/users/profile
 */
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      error: "Failed to get profile",
    });
  }
});

/*
 * UPDATE NUTRITION GOALS
 * PUT /api/users/profile
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      calorieGoal,
      protein,
      carbs,
      fats,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Validate values
    if (
      calorieGoal !== undefined &&
      Number(calorieGoal) <= 0
    ) {
      return res.status(400).json({
        error: "Calorie goal must be greater than 0",
      });
    }

    if (
      protein !== undefined &&
      Number(protein) <= 0
    ) {
      return res.status(400).json({
        error: "Protein goal must be greater than 0",
      });
    }

    if (
      carbs !== undefined &&
      Number(carbs) <= 0
    ) {
      return res.status(400).json({
        error: "Carbohydrate goal must be greater than 0",
      });
    }

    if (
      fats !== undefined &&
      Number(fats) <= 0
    ) {
      return res.status(400).json({
        error: "Fat goal must be greater than 0",
      });
    }

    // Update calorie goal
    if (calorieGoal !== undefined) {
      user.calorieGoal = Number(calorieGoal);
    }

    // Update macro goals
    if (protein !== undefined) {
      user.macroGoals.protein = Number(protein);
    }

    if (carbs !== undefined) {
      user.macroGoals.carbs = Number(carbs);
    }

    if (fats !== undefined) {
      user.macroGoals.fats = Number(fats);
    }

    await user.save();

    res.json({
      message: "Goals updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        calorieGoal: user.calorieGoal,

        macroGoals: {
          protein: user.macroGoals.protein,
          carbs: user.macroGoals.carbs,
          fats: user.macroGoals.fats,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      error: "Failed to update goals",
    });
  }
});

module.exports = router;