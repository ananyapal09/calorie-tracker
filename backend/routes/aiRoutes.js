const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const rateLimit = require("express-rate-limit");
const {
  parseMeal,
  nutritionData,
} = require("../services/mealParser");

const Meal = require("../models/Meal");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const PYTHON_PATH =
  "/Users/ananya/Desktop/calorie-tracker/.venv/bin/python";
const PYTHON_SCRIPT =
  "/Users/ananya/Desktop/calorie-tracker/food-ai/food_predict.py";

const router = express.Router();
const aiTextLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please try again later.",
  },
});

const aiImageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many image recognition requests. Please try again later.",
  },
});

/*
 * Run local Python food-recognition model
 */
function predictFood(imagePath) {
  return new Promise((resolve, reject) => {
    const python = spawn(PYTHON_PATH, [
      PYTHON_SCRIPT,
      imagePath,
    ]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python error:", errorOutput);

        return reject(
          new Error("Food recognition model failed")
        );
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        console.error(
          "Invalid Python output:",
          output
        );

        reject(
          new Error(
            "Food recognition returned invalid data"
          )
        );
      }
    });
  });
}

/*
 * Text-based meal parser
 */
router.post(
  "/parse-meal",
  protect,
  aiTextLimiter,
  async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Meal description is required",
      });
    }

    const result = await parseMeal(text);

    const meals = await Promise.all(
      result.items.map((item) =>
        Meal.create({
          userId: req.userId,
          food: item.food,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.estimatedCalories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          mealType: "snack",
        })
      )
    );

    res.status(201).json({
      message: "Meal parsed and saved successfully",
      items: result.items,
      totalCalories: result.totalCalories,
      meals,
    });
  } catch (error) {
    console.error("Meal parsing error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

/*
 * Image-based food recognition
 */
router.post(
  "/parse-image",
  protect,
  aiImageLimiter,
  upload.single("image"),
  async (req, res) => {
    let imagePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Food image is required",
        });
      }

imagePath = path.resolve(req.file.path);

      /*
       * Send image to local Python model
       */
      const result = await predictFood(imagePath);

      /*
       * Python returns:
       *
       * {
       *   predictions: [
       *     {
       *       food: "rice",
       *       confidence: 0.9771
       *     }
       *   ]
       * }
       */
      const prediction = result.predictions?.[0];

if (!prediction) {
  return res.status(422).json({
    error:
      result.error ||
      "Food could not be identified confidently. Please upload a clearer food image.",
  });
}

      if (
        !prediction.food ||
        typeof prediction.food !== "string"
      ) {
        return res.status(422).json({
          error: "Could not identify a food item",
        });
      }

      const detectedFood = prediction.food
        .toLowerCase()
        .trim();

      /*
       * Match prediction against our nutrition database
       */
      let matchedFood = null;

      for (const [foodName, food] of Object.entries(
        nutritionData
      )) {
        const aliases = food.aliases || [];

        if (
          foodName === detectedFood ||
          aliases.some(
            (alias) => alias === detectedFood
          )
        ) {
          matchedFood = {
            name: foodName,
            ...food,
          };

          break;
        }
      }

      /*
       * Food recognized but nutrition data unavailable
       */
      if (!matchedFood) {
        return res.status(422).json({
          error:
            "Food identified, but it is not available in our nutrition database",
          detectedFood,
        });
      }

      /*
       * Send result back to React
       */
      return res.json({
        message:
          "Food image recognized successfully",

        prediction: {
          food: matchedFood.name,
          confidence: prediction.confidence,
        },

        nutrition: {
          unit: matchedFood.unit,
          calories: matchedFood.calories,
          protein: matchedFood.protein,
          carbs: matchedFood.carbs,
          fats: matchedFood.fats,
        },
      });
    } catch (error) {
      console.error(
        "Image recognition error:",
        error
      );

      return res.status(500).json({
        error: "Failed to process food image",
      });
    } finally {
      /*
       * Always remove uploaded image
       */
      if (imagePath) {
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (cleanupError) {
          console.error(
            "Image cleanup error:",
            cleanupError
          );
        }
      }
    }
  }
);
/*
 * Get nutrition for a manually selected food
 */
router.get("/nutrition/:food", protect, async (req, res) => {
  try {
    const requestedFood = req.params.food
      .toLowerCase()
      .trim();

    let matchedFood = null;

    for (const [foodName, food] of Object.entries(
      nutritionData
    )) {
      const aliases = food.aliases || [];

      if (
        foodName === requestedFood ||
        aliases.some(
          (alias) => alias === requestedFood
        )
      ) {
        matchedFood = {
          name: foodName,
          ...food,
        };

        break;
      }
    }

    if (!matchedFood) {
      return res.status(404).json({
        error: "Food not found in nutrition database",
      });
    }

    return res.json({
      food: matchedFood.name,
      nutrition: {
        unit: matchedFood.unit,
        calories: matchedFood.calories,
        protein: matchedFood.protein,
        carbs: matchedFood.carbs,
        fats: matchedFood.fats,
      },
    });
  } catch (error) {
    console.error(
      "Nutrition lookup error:",
      error
    );

    return res.status(500).json({
      error: "Failed to get nutrition information",
    });
  }
});

module.exports = router;