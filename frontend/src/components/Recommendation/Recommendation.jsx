import React, { useState } from "react";

function Recommendation() {
  const [goal, setGoal] = useState("");
  const [meals, setMeals] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState(null);

  const goalInfo = {
    lose: {
      title: "Lose Weight",
      subtitle: "Light & balanced meals",
      icon: "🔥",
    },
    maintain: {
      title: "Maintain Weight",
      subtitle: "Balanced everyday nutrition",
      icon: "⚖️",
    },
    gain: {
      title: "Gain Weight",
      subtitle: "Higher-calorie nutritious meals",
      icon: "💪",
    },
  };

  const fetchSuggestions = async (selectedGoal) => {
    setGoal(selectedGoal);
    setLoading(true);
    setError("");
    setMeals([]);
    setRemaining(null);
    setTargets(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `http://localhost:5001/api/meals/suggestions?goal=${encodeURIComponent(
          selectedGoal
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          // Always get the latest calorie/macro goals
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to get meal suggestions"
        );
      }

      console.log("Latest recommendation data:", data);

      // Latest goals from MongoDB
      setTargets(data.targets || null);

      // Latest remaining nutrition
      setRemaining(data.remaining || null);

      // Latest suggestions
      setMeals(data.suggestions || []);
    } catch (err) {
      console.error("Suggestion error:", err);

      setError(err.message);

      setMeals([]);
      setRemaining(null);
      setTargets(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendation-page">

      {/* Header */}
      <section className="recommendation-header">
        <div className="header-icon">
          🥗
        </div>

        <h1>
          Meal Recommendations
        </h1>

        <p>
          Choose your fitness goal and discover meals that fit
          your daily nutrition needs.
        </p>
      </section>

      {/* Main Container */}
      <div className="recommendation-container">

        {/* Main Card */}
        <div className="recommendation-card">

          {/* Card Header */}
          <div className="card-header-custom">

            <div>
              <h2>
                Find Your Meal Plan
              </h2>

              <p>
                Select your goal to get personalized meal suggestions.
              </p>
            </div>

            <div className="header-food-icon">
              🍎
            </div>

          </div>

          {/* Goal Selection */}
          <label className="goal-label">
            What's your goal?
          </label>

          <div className="goal-grid">

            {/* Lose */}
            <button
              type="button"
              className={`goal-option ${
                goal === "lose" ? "active" : ""
              }`}
              onClick={() => fetchSuggestions("lose")}
              disabled={loading}
            >
              <span className="goal-icon">
                🔥
              </span>

              <span className="goal-title">
                Lose Weight
              </span>

              <span className="goal-subtitle">
                Calorie-conscious meals
              </span>
            </button>

            {/* Maintain */}
            <button
              type="button"
              className={`goal-option ${
                goal === "maintain" ? "active" : ""
              }`}
              onClick={() => fetchSuggestions("maintain")}
              disabled={loading}
            >
              <span className="goal-icon">
                ⚖️
              </span>

              <span className="goal-title">
                Maintain
              </span>

              <span className="goal-subtitle">
                Balanced nutrition
              </span>
            </button>

            {/* Gain */}
            <button
              type="button"
              className={`goal-option ${
                goal === "gain" ? "active" : ""
              }`}
              onClick={() => fetchSuggestions("gain")}
              disabled={loading}
            >
              <span className="goal-icon">
                💪
              </span>

              <span className="goal-title">
                Gain Weight
              </span>

              <span className="goal-subtitle">
                Energy-rich meals
              </span>
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center my-4">

              <div className="spinner-border text-success" />

              <p className="mt-2">
                Finding meals for you...
              </p>

            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger mt-4">
              {error}
            </div>
          )}

          {/* No Goal */}
          {!goal && !loading && !error && (
            <div className="empty-recommendation">

              <div className="empty-icon">
                🍽️
              </div>

              <h3>
                Choose a goal to get started
              </h3>

              <p>
                Select one of the options above and we'll show you
                recommended meals.
              </p>

            </div>
          )}

          {/* Results */}
          {goal && !loading && !error && (
            <>

              {/* Selected Goal */}
              <div className="selected-goal">

                <div className="selected-goal-icon">
                  {goalInfo[goal].icon}
                </div>

                <div>

                  <span className="selected-label">
                    YOUR SELECTED GOAL
                  </span>

                  <h3>
                    {goalInfo[goal].title}
                  </h3>

                  <p>
                    {goalInfo[goal].subtitle}
                  </p>

                </div>

                <div className="meal-count">

                  <strong>
                    {meals.length}
                  </strong>

                  <span>
                    Meals
                  </span>

                </div>

              </div>

              {/* Nutrition Target */}
              {targets && (
                <div className="nutrition-target-summary">

                  <div>
                    <span>
                      Daily Goal
                    </span>

                    <strong>
                      {targets.calories} kcal
                    </strong>
                  </div>

                  <div>
                    <span>
                      Protein
                    </span>

                    <strong>
                      {targets.protein}g
                    </strong>
                  </div>

                  <div>
                    <span>
                      Carbs
                    </span>

                    <strong>
                      {targets.carbs}g
                    </strong>
                  </div>

                  <div>
                    <span>
                      Fats
                    </span>

                    <strong>
                      {targets.fats}g
                    </strong>
                  </div>

                </div>
              )}

              {/* Recommendation Heading */}
              <div className="meals-heading">

                <div>
                  <h3>
                    Recommended Meals
                  </h3>

                  <p>
                    Simple options to support your goal.
                  </p>
                </div>

                {/* Calories Left */}
                <div className="total-calories">

                  <span>
                    Calories Left
                  </span>

                  <strong>
                    {remaining?.calories ?? 0} kcal
                  </strong>

                </div>

              </div>

              {/* Meal List */}
              <div className="meal-list">

                {meals.length === 0 ? (

                  remaining?.calories <= 0 ? (

                    <div className="empty-recommendation">

                      <div className="empty-icon">
                        🎉
                      </div>

                      <h3>
                        You've reached your calorie goal for today!
                      </h3>

                      <p>
                        You've logged all the calories planned
                        for today. Check back tomorrow for new
                        recommendations.
                      </p>

                    </div>

                  ) : (

                    <div className="empty-recommendation">

                      <div className="empty-icon">
                        🍽️
                      </div>

                      <h3>
                        No suitable meals found
                      </h3>

                      <p>
                        You may not have enough remaining nutrition
                        allowance for the available meals.
                      </p>

                    </div>

                  )

                ) : (

                  meals.map((meal, index) => (

                    <div
                      className="meal-item"
                      key={index}
                    >

                      <div className="meal-icon">
                        🍽️
                      </div>

                      <div className="meal-info">

                        <span className="meal-type">
                          SUGGESTED MEAL
                        </span>

                        <h4>
                          {meal.name}
                        </h4>

                        <p>
                          {meal.items?.map(
                            (item, itemIndex) => (
                              <span key={itemIndex}>
                                {item.quantity} {item.unit}{" "}
                                {item.food}

                                {itemIndex <
                                meal.items.length - 1
                                  ? " + "
                                  : ""}
                              </span>
                            )
                          )}
                        </p>

                        <div className="meal-macros">

                          <span>
                            Protein{" "}
                            {meal.nutrition?.protein ?? 0}g
                          </span>

                          <span>
                            Carbs{" "}
                            {meal.nutrition?.carbs ?? 0}g
                          </span>

                          <span>
                            Fat{" "}
                            {meal.nutrition?.fats ?? 0}g
                          </span>

                        </div>

                      </div>

                      <div className="meal-calories">

                        <strong>
                          {meal.nutrition?.calories ?? 0}
                        </strong>

                        <span>
                          kcal
                        </span>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </>
          )}

        </div>

        {/* Nutrition Tip */}
        <div className="nutrition-tip">

          <div className="tip-icon">
            💡
          </div>

          <div>

            <h3>
              Healthy Tip
            </h3>

            <p>
              Stay hydrated throughout the day and combine
              balanced meals with regular physical activity
              for better results.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Recommendation;