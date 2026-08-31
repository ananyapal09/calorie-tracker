const nutritionData = {
  egg: {
    aliases: ["egg", "eggs"],
    unit: "piece",
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fats: 5.3,
  },

  banana: {
    aliases: ["banana", "bananas"],
    unit: "piece",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
  },

  peanutButter: {
    aliases: ["peanut butter", "peanutbutter"],
    unit: "tablespoon",
    calories: 94,
    protein: 4,
    carbs: 3.2,
    fats: 8,
  },

  apple: {
    aliases: ["apple", "apples"],
    unit: "piece",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fats: 0.3,
  },

  toast: {
    aliases: ["toast", "toasts"],
    unit: "slice",
    calories: 80,
    protein: 3,
    carbs: 14,
    fats: 1,
  },

  bread: {
    aliases: ["bread"],
    unit: "slice",
    calories: 80,
    protein: 3,
    carbs: 14,
    fats: 1,
  },

  rice: {
    aliases: ["rice"],
    unit: "cup",
    calories: 205,
    protein: 4.3,
    carbs: 44.5,
    fats: 0.4,
  },

  chicken: {
    aliases: ["chicken", "chicken breast"],
    unit: "100g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
  },

  roti: {
    aliases: ["roti", "chapati", "chapathi"],
    unit: "piece",
    calories: 120,
    protein: 3.5,
    carbs: 18,
    fats: 3,
  },

  milk: {
    aliases: ["milk"],
    unit: "cup",
    calories: 122,
    protein: 8,
    carbs: 12,
    fats: 4.8,
  },

  oats: {
    aliases: ["oats", "oatmeal"],
    unit: "cup",
    calories: 307,
    protein: 10.7,
    carbs: 54.8,
    fats: 5.3,
  },

  potato: {
    aliases: ["potato", "potatoes"],
    unit: "piece",
    calories: 130,
    protein: 3,
    carbs: 30,
    fats: 0.2,
  },

  orange: {
    aliases: ["orange", "oranges"],
    unit: "piece",
    calories: 62,
    protein: 1.2,
    carbs: 15.4,
    fats: 0.2,
  },

  yogurt: {
    aliases: ["yogurt", "curd"],
    unit: "cup",
    calories: 150,
    protein: 8.5,
    carbs: 11,
    fats: 8,
  },

  dal: {
    aliases: ["dal", "lentils"],
    unit: "cup",
    calories: 230,
    protein: 18,
    carbs: 40,
    fats: 0.8,
  },

  paneer: {
    aliases: ["paneer"],
    unit: "100g",
    calories: 265,
    protein: 18,
    carbs: 6,
    fats: 20,
  },
};


// ------------------------------------
// Number words
// ------------------------------------

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};


// ------------------------------------
// Get quantity of food
// ------------------------------------

function getQuantity(text, foodIndex) {
  const beforeFood = text.slice(
    Math.max(0, foodIndex - 40),
    foodIndex
  );

  // Example:
  // "2 eggs"
  // "3 bananas"
  const numberMatch = beforeFood.match(
    /(\d+(?:\.\d+)?)\s*$/
  );

  if (numberMatch) {
    return Number(numberMatch[1]);
  }

  // Example:
  // "2 slices toast"
  // "3 pieces egg"
  const quantityMatch = beforeFood.match(
    /(\d+(?:\.\d+)?)\s+(?:slices?|pieces?|cups?|bowls?|servings?)\s+(?:of\s+)?$/i
  );

  if (quantityMatch) {
    return Number(quantityMatch[1]);
  }

  // Example:
  // "two eggs"
  // "three bananas"
  const words = beforeFood.trim().split(/\s+/);

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i];

    if (numberWords[word] !== undefined) {
      return numberWords[word];
    }
  }

  return 1;
}


// ------------------------------------
// Parse manually entered meal
// ------------------------------------

async function parseMeal(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Meal description is required");
  }

  const normalizedText = text
    .toLowerCase()
    .replace(/[,.!?]/g, " ");

  const items = [];

  for (const [foodName, food] of Object.entries(
    nutritionData
  )) {
    for (const alias of food.aliases) {
      const index = normalizedText.indexOf(alias);

      if (index !== -1) {
        const quantity = getQuantity(
          normalizedText,
          index
        );

        items.push({
          food: foodName,
          quantity,
          unit: food.unit,

          estimatedCalories:
            quantity * food.calories,

          protein:
            Number(
              (quantity * food.protein).toFixed(1)
            ),

          carbs:
            Number(
              (quantity * food.carbs).toFixed(1)
            ),

          fats:
            Number(
              (quantity * food.fats).toFixed(1)
            ),
        });

        break;
      }
    }
  }

  if (items.length === 0) {
    throw new Error(
      "Could not identify any supported food items"
    );
  }

  const totalCalories = items.reduce(
    (total, item) =>
      total + item.estimatedCalories,
    0
  );

  const totalProtein = items.reduce(
    (total, item) =>
      total + item.protein,
    0
  );

  const totalCarbs = items.reduce(
    (total, item) =>
      total + item.carbs,
    0
  );

  const totalFats = items.reduce(
    (total, item) =>
      total + item.fats,
    0
  );

  return {
    items,

    totalCalories,

    totalProtein:
      Number(totalProtein.toFixed(1)),

    totalCarbs:
      Number(totalCarbs.toFixed(1)),

    totalFats:
      Number(totalFats.toFixed(1)),
  };
}


// ------------------------------------
// Generate meal suggestions
// ------------------------------------


function getMealSuggestions(remaining, goal) {
  const {
    calories = 0,
    protein = 0,
    carbs = 0,
    fats = 0,
  } = remaining || {};

  const mealTemplates = [
    {
      name: "Eggs & Toast",
      items: [
        { food: "egg", quantity: 2 },
        { food: "toast", quantity: 2 },
      ],
    },

    {
      name: "Eggs & Banana",
      items: [
        { food: "egg", quantity: 2 },
        { food: "banana", quantity: 1 },
      ],
    },

    {
      name: "Chicken & Rice",
      items: [
        { food: "chicken", quantity: 1 },
        { food: "rice", quantity: 1 },
      ],
    },

    {
      name: "Chicken & Roti",
      items: [
        { food: "chicken", quantity: 1 },
        { food: "roti", quantity: 2 },
      ],
    },

    {
      name: "Dal & Rice",
      items: [
        { food: "dal", quantity: 1 },
        { food: "rice", quantity: 1 },
      ],
    },

    {
      name: "Dal & Roti",
      items: [
        { food: "dal", quantity: 1 },
        { food: "roti", quantity: 2 },
      ],
    },

    {
      name: "Paneer & Roti",
      items: [
        { food: "paneer", quantity: 1 },
        { food: "roti", quantity: 2 },
      ],
    },

    {
      name: "Oats & Milk",
      items: [
        { food: "oats", quantity: 1 },
        { food: "milk", quantity: 1 },
      ],
    },

    {
      name: "Oats, Milk & Banana",
      items: [
        { food: "oats", quantity: 1 },
        { food: "milk", quantity: 1 },
        { food: "banana", quantity: 1 },
      ],
    },

    {
      name: "Yogurt & Banana",
      items: [
        { food: "yogurt", quantity: 1 },
        { food: "banana", quantity: 1 },
      ],
    },

    {
      name: "Rice & Egg",
      items: [
        { food: "rice", quantity: 1 },
        { food: "egg", quantity: 2 },
      ],
    },

    {
      name: "Potato & Eggs",
      items: [
        { food: "potato", quantity: 1 },
        { food: "egg", quantity: 2 },
      ],
    },
  ];

  // -----------------------------
  // Filter meals according to goal
  // -----------------------------

  let filteredTemplates = mealTemplates;

  if (goal === "lose") {
    filteredTemplates = mealTemplates.filter((meal) =>
      [
        "Eggs & Toast",
        "Eggs & Banana",
        "Chicken & Rice",
        "Chicken & Roti",
        "Dal & Rice",
        "Dal & Roti",
        "Yogurt & Banana",
        "Rice & Egg",
        "Potato & Eggs",
      ].includes(meal.name)
    );
  }

  if (goal === "maintain") {
    filteredTemplates = mealTemplates.filter((meal) =>
      [
        "Chicken & Rice",
        "Chicken & Roti",
        "Dal & Rice",
        "Dal & Roti",
        "Paneer & Roti",
        "Oats & Milk",
        "Rice & Egg",
      ].includes(meal.name)
    );
  }

  if (goal === "gain") {
    filteredTemplates = mealTemplates.filter((meal) =>
      [
        "Paneer & Roti",
        "Oats & Milk",
        "Oats, Milk & Banana",
        "Dal & Rice",
        "Chicken & Roti",
        "Potato & Eggs",
      ].includes(meal.name)
    );
  }

  // -----------------------------
  // No calories remaining
  // -----------------------------

  if (calories <= 0) {
    return [];
  }

  const suggestions = [];

  // -----------------------------
  // Calculate nutrition for meals
  // -----------------------------

  for (const meal of filteredTemplates) {
    let mealCalories = 0;
    let mealProtein = 0;
    let mealCarbs = 0;
    let mealFats = 0;

    const items = [];

    for (const item of meal.items) {
      const food = nutritionData[item.food];

      if (!food) continue;

      mealCalories += item.quantity * food.calories;
      mealProtein += item.quantity * food.protein;
      mealCarbs += item.quantity * food.carbs;
      mealFats += item.quantity * food.fats;

      items.push({
        food: item.food,
        quantity: item.quantity,
        unit: food.unit,
      });
    }

    // -----------------------------
    // Only show meals that fit
    // within remaining calories
    // -----------------------------

    if (mealCalories <= calories) {
      const calorieFit =
        mealCalories / calories;

      suggestions.push({
        name: meal.name,

        items,

        nutrition: {
          calories: Math.round(mealCalories),
          protein: Number(
            mealProtein.toFixed(1)
          ),
          carbs: Number(
            mealCarbs.toFixed(1)
          ),
          fats: Number(
            mealFats.toFixed(1)
          ),
        },

        score: Number(
          calorieFit.toFixed(3)
        ),
      });
    }
  }

  // Highest calorie-fit first
  suggestions.sort(
    (a, b) => b.score - a.score
  );

  // Return maximum 5 meals
  return suggestions.slice(0, 5);
}

// ------------------------------------
// Exports
// ------------------------------------

module.exports = {
  parseMeal,
  nutritionData,
  getMealSuggestions,
};