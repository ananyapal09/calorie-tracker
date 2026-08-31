import React, { useState, useEffect } from "react";

function MealCard({ onMealAdded }) {

  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealText, setMealText] = useState("");
  const [meals, setMeals] = useState([]);

  // Nutrition goals come from MongoDB
  const [goal, setGoal] = useState("");
  const [macroGoals, setMacroGoals] = useState({
    protein: 100,
    carbs: 250,
    fats: 65,
  });

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH USER PROFILE
  // ==========================================

  const fetchProfile = async () => {
    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/users/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch profile"
        );
      }

      const calorieGoal = Number(data.user?.calorieGoal);

      if (calorieGoal > 0) {
        setGoal(calorieGoal);
      } else {
        setGoal("");
      }

      // Keep existing macro goals
      if (data.user?.macroGoals) {
        setMacroGoals({
          protein: Number(data.user.macroGoals.protein) || 100,
          carbs: Number(data.user.macroGoals.carbs) || 250,
          fats: Number(data.user.macroGoals.fats) || 65,
        });
      }

      console.log(
        "CALORIE GOAL FROM DATABASE:",
        calorieGoal
      );

    } catch (error) {
      console.error(
        "Failed to fetch profile:",
        error
      );

      setError(error.message);
    }
  };

  // ==========================================
  // FETCH TODAY'S MEALS
  // ==========================================

  const fetchMeals = async () => {
    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/meals",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch meals"
        );
      }

      // Backend already returns today's meals,
      // but we keep this filtering as an extra safeguard.
      const today = new Date();

      const todayMeals = data.filter((meal) => {
        const mealDate = new Date(meal.date);

        return (
          mealDate.getDate() === today.getDate() &&
          mealDate.getMonth() === today.getMonth() &&
          mealDate.getFullYear() === today.getFullYear()
        );
      });

      setMeals(todayMeals);

    } catch (error) {
      console.error(
        "Failed to fetch meals:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchMeals(),
      ]);
    };

    loadData();
  }, []);

  // ==========================================
  // SAVE CALORIE GOAL TO DATABASE
  // ==========================================

  const saveGoal = async () => {
    const calorieGoal = Number(goal);

    if (!calorieGoal || calorieGoal <= 0) {
      setError(
        "Please enter a valid calorie goal greater than 0."
      );
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    setSavingGoal(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            calorieGoal: calorieGoal,

            // Send existing macro goals because
            // your backend controller expects all goals.
            protein: macroGoals.protein,
            carbs: macroGoals.carbs,
            fats: macroGoals.fats,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update calorie goal"
        );
      }

      // Use the value returned by MongoDB
      const savedGoal = Number(
        data.user?.calorieGoal
      );

      setGoal(savedGoal);

      if (data.user?.macroGoals) {
        setMacroGoals({
          protein:
            Number(data.user.macroGoals.protein) || 100,
          carbs:
            Number(data.user.macroGoals.carbs) || 250,
          fats:
            Number(data.user.macroGoals.fats) || 65,
        });
      }

      console.log(
        "CALORIE GOAL SAVED TO DATABASE:",
        savedGoal
      );

    } catch (error) {
      console.error(
        "Failed to save calorie goal:",
        error
      );

      setError(error.message);

    } finally {
      setSavingGoal(false);
    }
  };

  // ==========================================
  // MANUAL MEAL ENTRY
  // ==========================================

  const addMeal = async (e) => {
    e.preventDefault();

    if (!mealName.trim()) {
      return alert("Please enter a meal name.");
    }

    const cal = Number(calories);

    if (!cal || cal <= 0) {
      return alert(
        "Please enter a valid positive calorie value."
      );
    }

    if (!token) {
      return alert("Please login again.");
    }

    setAdding(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/meals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            food: mealName.trim(),
            quantity: 1,
            unit: "serving",
            calories: cal,
            protein: 0,
            carbs: 0,
            fats: 0,
            mealType: "snack",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add meal"
        );
      }

      setMeals((currentMeals) => [
        data.meal,
        ...currentMeals,
      ]);

      setMealName("");
      setCalories("");
      if (onMealAdded) {
  await onMealAdded();
      }


    } catch (error) {
      console.error(
        "Failed to add meal:",
        error
      );

      setError(error.message);

    } finally {
      setAdding(false);
    }
  };

  // ==========================================
  // AI MEAL ANALYSIS
  // ==========================================

  const analyzeMeal = async (e) => {
    e.preventDefault();

    if (!mealText.trim()) {
      return alert("Tell me what you ate.");
    }

    if (!token) {
      return alert("Please login again.");
    }

    setAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/ai/parse-meal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: mealText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze meal"
        );
      }

      setAnalysisResult(data);

      // Refresh today's meals
      await fetchMeals();
      if (onMealAdded) {
  await onMealAdded();
}


      setMealText("");

    } catch (error) {
      console.error(
        "Meal analysis error:",
        error
      );

      setError(error.message);

    } finally {
      setAnalyzing(false);
    }
  };

  // ==========================================
  // TOTAL CALORIES
  // ==========================================

  const totalCalories = meals.reduce(
    (total, meal) =>
      total + (Number(meal.calories) || 0),
    0
  );

  // ==========================================
  // PROGRESS
  // ==========================================

  const progressPercent =
    goal && goal > 0
      ? Math.min(
          (totalCalories / Number(goal)) * 100,
          100
        )
      : 0;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="meal-tracker">

      {/* Header */}
      <div className="tracker-header">

        <div>
          <span className="tracker-label">
            NUTRITION TRACKER
          </span>

          <h2>Track your meals</h2>

          <p>
            Keep track of what you eat and stay
            on top of your daily goals.
          </p>
        </div>

        <div className="tracker-icon">
          <i className="fas fa-leaf"></i>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="tracker-error">
          <i className="fas fa-circle-exclamation me-2"></i>
          {error}
        </div>
      )}

      {/* ==========================================
          AI MEAL PARSER
          ========================================== */}

      <div className="ai-meal-box">

        <div className="ai-heading">

          <div className="ai-icon">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>

          <div>
            <h4>Describe what you ate</h4>

            <p>
              Let AI identify the food and estimate
              its nutrition.
            </p>
          </div>

        </div>

        <form onSubmit={analyzeMeal}>

          <textarea
            value={mealText}
            onChange={(e) =>
              setMealText(e.target.value)
            }
            placeholder="e.g. I ate 2 eggs, 2 slices of toast and a banana"
          />

          <div className="ai-submit-row">

            <span>
              <i className="fas fa-lightbulb"></i>
              Try describing multiple foods at once
            </span>

            <button
              type="submit"
              disabled={
                analyzing ||
                !mealText.trim()
              }
            >
              <i className="fas fa-sparkles me-2"></i>

              {analyzing
                ? "Analyzing..."
                : "Analyze Meal"}
            </button>

          </div>

        </form>

      </div>

      {/* ==========================================
          AI ANALYSIS RESULT
          ========================================== */}

      {analysisResult && (
        <div className="analysis-result">

          <div className="result-header">

            <div>
              <i className="fas fa-circle-check"></i>
              Meal analyzed successfully
            </div>

            <strong>
              {analysisResult.totalCalories} kcal
            </strong>

          </div>

          <div className="result-items">

            {analysisResult.items?.map(
              (item, index) => (

                <div
                  className="result-item"
                  key={index}
                >

                  <div>

                    <strong>
                      {item.food}
                    </strong>

                    <span>
                      {item.quantity} {item.unit}
                    </span>

                  </div>

                  <strong>
                    {item.estimatedCalories} kcal
                  </strong>

                </div>

              )
            )}

          </div>

        </div>
      )}

      {/* ==========================================
          CALORIE GOAL
          ========================================== */}

      <div className="goal-section">

        <div className="section-title">

          <div>
            <span>DAILY TARGET</span>

            <h4>
              Set your calorie goal
            </h4>
          </div>

          <i className="fas fa-bullseye"></i>

        </div>

        <div className="goal-input-wrapper">

          <input
            type="number"
            value={goal}
            onChange={(e) => {
              const value = e.target.value;

              setGoal(
                value === ""
                  ? ""
                  : Number(value)
              );
            }}
            placeholder="2000"
            min="1"
          />

          <span>
            kcal / day
          </span>

        </div>

        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={saveGoal}
          disabled={
            savingGoal ||
            goal === "" ||
            Number(goal) <= 0
          }
        >
          <i className="fas fa-save me-2"></i>

          {savingGoal
            ? "Saving..."
            : "Save Goal"}
        </button>

      </div>

      {/* ==========================================
          TODAY'S PROGRESS
          ========================================== */}

      {goal !== "" && Number(goal) > 0 && (
        <div className="progress-section">

          <div className="section-title">

            <div>
              <span>
                TODAY'S PROGRESS
              </span>

              <h4>
                Calorie intake
              </h4>
            </div>

            <i className="fas fa-chart-line"></i>

          </div>

          <div className="progress-info">

            <div>

              <span>
                CONSUMED
              </span>

              <strong>
                {totalCalories}
                <small> kcal</small>
              </strong>

            </div>

            <div className="progress-target">

              <span>
                GOAL
              </span>

              <strong>
                {goal}
                <small> kcal</small>
              </strong>

            </div>

          </div>

          <div className="tracker-progress">

            <div
              className={
                totalCalories > Number(goal)
                  ? "progress-danger"
                  : "progress-success"
              }
              style={{
                width: `${progressPercent}%`,
              }}
            />

          </div>

          <div className="progress-bottom">

            <span>
              {Math.round(progressPercent)}%
              {" "}of daily goal
            </span>

            {totalCalories > Number(goal) ? (

              <span className="danger-text">
                {totalCalories - Number(goal)}
                {" "}kcal over
              </span>

            ) : (

              <span className="success-text">
                {Number(goal) - totalCalories}
                {" "}kcal remaining
              </span>

            )}

          </div>

        </div>
      )}

      {/* ==========================================
          MANUAL MEAL ENTRY
          ========================================== */}

      <div className="manual-section">

        <div className="section-title">

          <div>
            <span>
              QUICK ENTRY
            </span>

            <h4>
              Add a meal manually
            </h4>
          </div>

          <i className="fas fa-plus"></i>

        </div>

        <form
          onSubmit={addMeal}
          className="manual-inputs"
        >

          <div className="input-group-custom">

            <label>
              Meal name
            </label>

            <input
              type="text"
              placeholder="e.g. Chicken salad"
              value={mealName}
              onChange={(e) =>
                setMealName(e.target.value)
              }
            />

          </div>

          <div className="input-group-custom">

            <label>
              Calories
            </label>

            <input
              type="number"
              placeholder="350"
              value={calories}
              onChange={(e) =>
                setCalories(e.target.value)
              }
              min="1"
            />

          </div>

          <button
            type="submit"
            disabled={
              adding ||
              !mealName.trim() ||
              !calories
            }
          >

            <i className="fas fa-plus me-2"></i>

            {adding
              ? "Adding..."
              : "Add Meal"}

          </button>

        </form>

      </div>

      {/* ==========================================
          TODAY'S MEALS
          ========================================== */}

      <div className="meals-section">

        <div className="section-title">

          <div>
            <span>
              TODAY
            </span>

            <h4>
              Today's meals
            </h4>
          </div>

          <div className="meal-count">
            {meals.length}
          </div>

        </div>

        {loading ? (

          <div className="empty-meals">

            <div className="empty-icon">
              <i className="fas fa-spinner fa-spin"></i>
            </div>

            <h5>
              Loading meals...
            </h5>

          </div>

        ) : meals.length === 0 ? (

          <div className="empty-meals">

            <div className="empty-icon">
              <i className="fas fa-utensils"></i>
            </div>

            <h5>
              No meals logged yet
            </h5>

            <p>
              Use the AI parser or add a meal manually.
            </p>

          </div>

        ) : (

          <div className="meal-list">

            {meals.map((meal) => (

              <div
                className="meal-row"
                key={meal._id}
              >

                <div className="meal-food-icon">

                  <i className="fas fa-utensils"></i>

                </div>

                <div className="meal-details">

                  <strong>
                    {meal.food}
                  </strong>

                  <span>
                    {meal.quantity}{" "}
                    {meal.unit}
                  </span>

                </div>

                <div className="meal-calories">

                  <strong>
                    {meal.calories}
                  </strong>

                  <span>
                    kcal
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default MealCard;