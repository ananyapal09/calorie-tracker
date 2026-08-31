const Meal = require("../models/Meal");

const createMeal = async (req, res) => {
  try {
    const {
      food,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fats,
      mealType,
      date,
    } = req.body;

    if (!food || !quantity || !unit || calories === undefined) {
      return res.status(400).json({
        error: "Food, quantity, unit and calories are required",
      });
    }

    const meal = await Meal.create({
      userId: req.userId,
      food,
      quantity,
      unit,
      calories,
      protein,
      carbs,
      fats,
      mealType,
      date,
    });

    res.status(201).json({
      message: "Meal added successfully",
      meal,
    });
  } catch (error) {
    console.error("Create meal error:", error);

    res.status(500).json({
      error: "Failed to create meal",
    });
  }
};

const getMeals = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ date: -1 });

    res.json(meals);
  } catch (error) {
    console.error("Get today's meals error:", error);

    res.status(500).json({
      error: "Failed to fetch today's meals",
    });
  }
};
const getDailySummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const summary = meals.reduce(
      (total, meal) => {
        total.calories += meal.calories;
        total.protein += meal.protein;
        total.carbs += meal.carbs;
        total.fats += meal.fats;

        return total;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      }
    );

    res.json({
date: startOfDay.toLocaleDateString("en-CA"),
      mealCount: meals.length,
      ...summary,
    });
  } catch (error) {
    console.error("Daily summary error:", error);

    res.status(500).json({
      error: "Failed to calculate daily summary",
    });
  }
};
const getWeeklySummary = async (req, res) => {
  try {
    const today = new Date();

    const days = [];

    // Last 7 calendar days, including today
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const meals = await Meal.find({
        userId: req.userId,
        date: {
          $gte: dayStart,
          $lte: dayEnd,
        },
      });

      const summary = meals.reduce(
        (total, meal) => {
          total.calories += meal.calories || 0;
          total.protein += meal.protein || 0;
          total.carbs += meal.carbs || 0;
          total.fats += meal.fats || 0;
          total.mealCount += 1;

          return total;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealCount: 0,
        }
      );

      days.push({
        date: day.toLocaleDateString("en-CA"),
        calories: summary.calories,
        protein: Number(summary.protein.toFixed(1)),
        carbs: Number(summary.carbs.toFixed(1)),
        fats: Number(summary.fats.toFixed(1)),
        mealCount: summary.mealCount,
      });
    }

    res.json({
      startDate: days[0].date,
      endDate: days[6].date,
      days,
    });
  } catch (error) {
    console.error("Weekly summary error:", error);

    res.status(500).json({
      error: "Failed to calculate weekly summary",
    });
  }
};

module.exports = {
  createMeal,
  getMeals,
  getDailySummary,
  getWeeklySummary,

};
