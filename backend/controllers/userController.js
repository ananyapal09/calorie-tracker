const User = require("../models/User");


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      error: "Failed to load profile",
    });
  }
};


// ==========================================
// UPDATE PROFILE
// PUT /api/users/profile
// ==========================================

const updateProfile = async (req, res) => {
  try {
    console.log(
      "UPDATE PROFILE BODY:",
      req.body
    );

    const {
      calorieGoal,
      protein,
      carbs,
      fats,
    } = req.body;

    // Convert to numbers
    const calories = Number(calorieGoal);
    const proteinGoal = Number(protein);
    const carbsGoal = Number(carbs);
    const fatsGoal = Number(fats);

    // Validate
    if (
      !calories ||
      !proteinGoal ||
      !carbsGoal ||
      !fatsGoal ||
      calories <= 0 ||
      proteinGoal <= 0 ||
      carbsGoal <= 0 ||
      fatsGoal <= 0
    ) {
      return res.status(400).json({
        error:
          "All nutrition goals must be greater than 0",
      });
    }

    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // UPDATE DATABASE
    user.calorieGoal = calories;

    user.macroGoals = {
      protein: proteinGoal,
      carbs: carbsGoal,
      fats: fatsGoal,
    };

    await user.save();

    console.log(
      "NEW CALORIE GOAL SAVED:",
      user.calorieGoal
    );

    return res.json({
      message:
        "Nutrition goals updated successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        calorieGoal: user.calorieGoal,
        macroGoals: user.macroGoals,
      },
    });

  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to update nutrition goals",
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
};