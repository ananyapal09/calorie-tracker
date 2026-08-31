const express = require("express");

const {
  createMeal,
  getMeals,
  getDailySummary,
  getWeeklySummary,
} = require("../controllers/mealController");

const {
  getMealSuggestions,
} = require("../services/mealParser");

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const Meal = require("../models/Meal");

const router = express.Router();

// ==========================================
// MEAL ROUTES
// ==========================================

router.post("/", protect, createMeal);

router.get("/", protect, getMeals);

router.get(
  "/summary/today",
  protect,
  getDailySummary
);

router.get(
  "/summary/weekly",
  protect,
  getWeeklySummary
);

// ==========================================
// MEAL SUGGESTIONS
// ==========================================

router.get(
  "/suggestions",
  protect,
  async (req, res) => {
    try {
      const { goal } = req.query;

      // Validate goal
      if (
        goal &&
        !["lose", "maintain", "gain"].includes(goal)
      ) {
        return res.status(400).json({
          error: "Invalid goal",
        });
      }

      // Get user
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's meals
      const todaysMeals = await Meal.find({
        userId: req.userId,
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      // Calculate consumed nutrition
      const consumed = todaysMeals.reduce(
        (total, meal) => {
          total.calories += Number(meal.calories) || 0;
          total.protein += Number(meal.protein) || 0;
          total.carbs += Number(meal.carbs) || 0;
          total.fats += Number(meal.fats) || 0;

          return total;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        }
      );

      // IMPORTANT:
      // Read the CURRENT values from MongoDB
      const targets = {
        calories: Number(user.calorieGoal) || 2000,

        protein:
          Number(user.macroGoals?.protein) || 100,

        carbs:
          Number(user.macroGoals?.carbs) || 250,

        fats:
          Number(user.macroGoals?.fats) || 65,
      };

      // Calculate remaining
      const remaining = {
        calories: Math.max(
          0,
          targets.calories - consumed.calories
        ),

        protein: Math.max(
          0,
          targets.protein - consumed.protein
        ),

        carbs: Math.max(
          0,
          targets.carbs - consumed.carbs
        ),

        fats: Math.max(
          0,
          targets.fats - consumed.fats
        ),
      };

      // Debug
      console.log("=================================");
      console.log("USER ID:", req.userId);
      console.log(
        "CALORIE GOAL FROM DATABASE:",
        user.calorieGoal
      );
      console.log(
        "MACRO GOALS FROM DATABASE:",
        user.macroGoals
      );
      console.log("GOAL SELECTED:", goal);
      console.log(
        "TODAY CONSUMED:",
        consumed.calories
      );
      console.log(
        "CALORIES REMAINING:",
        remaining.calories
      );
      console.log("=================================");

      // Generate suggestions
      const suggestions = getMealSuggestions(
        remaining,
        goal
      );

      return res.json({
        message:
          "Meal suggestions generated successfully",

        goal: goal || null,

        targets: {
          calories: Math.round(targets.calories),
          protein: Number(
            targets.protein.toFixed(1)
          ),
          carbs: Number(
            targets.carbs.toFixed(1)
          ),
          fats: Number(
            targets.fats.toFixed(1)
          ),
        },

        consumed: {
          calories: Math.round(
            consumed.calories
          ),
          protein: Number(
            consumed.protein.toFixed(1)
          ),
          carbs: Number(
            consumed.carbs.toFixed(1)
          ),
          fats: Number(
            consumed.fats.toFixed(1)
          ),
        },

        remaining: {
          calories: Math.round(
            remaining.calories
          ),
          protein: Number(
            remaining.protein.toFixed(1)
          ),
          carbs: Number(
            remaining.carbs.toFixed(1)
          ),
          fats: Number(
            remaining.fats.toFixed(1)
          ),
        },

        suggestions,
      });
    } catch (error) {
      console.error(
        "Meal suggestions error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to generate meal suggestions",
      });
    }
  }
);

module.exports = router;