import React, { useEffect, useState } from "react";

function FoodRecognition({ onMealAdded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /*
   * Nutrition database
   *
   * These values should match the backend nutritionData.
   * Values are for the default unit shown.
   */
  const nutritionData = {
    egg: {
      unit: "piece",
      calories: 78,
      protein: 6.3,
      carbs: 0.6,
      fats: 5.3,
    },

    banana: {
      unit: "piece",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fats: 0.4,
    },

    apple: {
      unit: "piece",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fats: 0.3,
    },

    orange: {
      unit: "piece",
      calories: 62,
      protein: 1.2,
      carbs: 15.4,
      fats: 0.2,
    },

    rice: {
      unit: "cup",
      calories: 205,
      protein: 4.3,
      carbs: 44.5,
      fats: 0.4,
    },

    dal: {
      unit: "cup",
      calories: 230,
      protein: 18,
      carbs: 40,
      fats: 0.8,
    },

    paneer: {
      unit: "100g",
      calories: 265,
      protein: 18,
      carbs: 6,
      fats: 20,
    },

    roti: {
      unit: "piece",
      calories: 120,
      protein: 3.5,
      carbs: 18,
      fats: 3,
    },

    chicken: {
      unit: "100g",
      calories: 165,
      protein: 31,
      carbs: 0,
      fats: 3.6,
    },

    bread: {
      unit: "slice",
      calories: 80,
      protein: 3,
      carbs: 14,
      fats: 1,
    },

    toast: {
      unit: "slice",
      calories: 80,
      protein: 3,
      carbs: 14,
      fats: 1,
    },

    milk: {
      unit: "cup",
      calories: 122,
      protein: 8,
      carbs: 12,
      fats: 4.8,
    },

    oats: {
      unit: "cup",
      calories: 307,
      protein: 10.7,
      carbs: 54.8,
      fats: 5.3,
    },

    potato: {
      unit: "piece",
      calories: 130,
      protein: 3,
      carbs: 30,
      fats: 0.2,
    },

    yogurt: {
      unit: "cup",
      calories: 150,
      protein: 8.5,
      carbs: 11,
      fats: 8,
    },

    "peanut butter": {
      unit: "tablespoon",
      calories: 94,
      protein: 4,
      carbs: 3.2,
      fats: 8,
    },
  };

  /*
   * Foods that the user can manually select
   */
  const foods = Object.keys(nutritionData);

  /*
   * Get nutrition for currently selected food and quantity.
   */
  const getCurrentNutrition = () => {
    if (!selectedFood || !nutritionData[selectedFood]) {
      return null;
    }

    const food = nutritionData[selectedFood];

    return {
      unit: food.unit,
      calories: Number(
        (food.calories * quantity).toFixed(1)
      ),
      protein: Number(
        (food.protein * quantity).toFixed(1)
      ),
      carbs: Number(
        (food.carbs * quantity).toFixed(1)
      ),
      fats: Number(
        (food.fats * quantity).toFixed(1)
      ),
    };
  };

  /*
   * When quantity changes, keep it valid.
   */
  useEffect(() => {
    if (quantity < 0.1 || Number.isNaN(quantity)) {
      setQuantity(1);
    }
  }, [quantity]);

  /*
   * Handle image upload
   */
  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPrediction(null);
    setSelectedFood("");
    setQuantity(1);
    setSaved(false);
    setError("");

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreview(imageUrl);
  };

  /*
   * Send image to backend -> CLIP model
   */
  const classifyImage = async () => {
    if (!file) {
      setError("Please select a food image first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before identifying food.");
      return;
    }

    setLoading(true);
    setPrediction(null);
    setSelectedFood("");
    setQuantity(1);
    setSaved(false);
    setError("");

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5001/api/ai/parse-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to identify food"
        );
      }

      setPrediction(data);

      /*
       * Automatically select CLIP's top prediction.
       */
      if (data.prediction?.food) {
        setSelectedFood(data.prediction.food);
      }
    } catch (err) {
      console.error("Food recognition error:", err);

      setError(
        err.message ||
          "Could not identify the food. Please try another image."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * User manually corrects the food.
   */
  const handleFoodChange = (event) => {
    setSelectedFood(event.target.value);
    setQuantity(1);
    setSaved(false);
    setError("");
  };

  /*
   * User changes quantity.
   */
  const handleQuantityChange = (event) => {
    const value = Number(event.target.value);

    if (value > 0) {
      setQuantity(value);
      setSaved(false);
    }
  };

  /*
   * Save corrected food + calculated nutrition
   */
  const confirmAndLog = async () => {
    if (!prediction) {
      setError("Please identify the food first.");
      return;
    }

    if (!selectedFood) {
      setError("Please select a food.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before logging a meal.");
      return;
    }

    const nutrition = getCurrentNutrition();

    if (!nutrition) {
      setError("Nutrition information is unavailable.");
      return;
    }

    setSaving(true);
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
            food: selectedFood,
            quantity: quantity,
            unit: nutrition.unit,

            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fats: nutrition.fats,

            mealType: "snack",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save meal"
        );
      }

      setSaved(true);
    } catch (err) {
      console.error("Save meal error:", err);

      setError(
        err.message || "Could not save the meal."
      );
    } finally {
      setSaving(false);
    }
  };

  const currentNutrition = getCurrentNutrition();

  return (
    <div className="card shadow-sm border-0 my-4">
      <div className="card-body p-4">

        {/* Header */}
        <h4 className="fw-bold mb-2">
          📸 Identify Food from Image
        </h4>

        <p className="text-muted">
          Upload a food photo and let the AI suggest what it is.
        </p>

        {/* Error */}
        {error && (
          <div className="alert alert-warning">
            {error}
          </div>
        )}

        {/* Image upload */}
        <input
          type="file"
          className="form-control mb-3"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />

        {/* Image preview */}
        {preview && (
          <div className="text-center mb-3">
            <img
              src={preview}
              alt="Selected food"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
        )}

        {/* Identify button */}
        {preview && (
          <button
            className="btn btn-success"
            onClick={classifyImage}
            disabled={loading}
          >
            {loading
              ? "Analyzing with AI..."
              : "Identify Food"}
          </button>
        )}

        {/* Prediction */}
        {prediction && (
          <div className="alert alert-success mt-4">

            <h5 className="fw-bold mb-1">
              AI Prediction
            </h5>

            <p className="mb-1">
              <strong>
                {prediction.prediction?.food}
              </strong>
            </p>

            <small>
              Confidence:{" "}
              {(
                prediction.prediction?.confidence * 100
              ).toFixed(1)}
              %
            </small>

            {/* Food correction */}
            <div className="mt-3">

              <label className="form-label fw-bold">
                Is this correct?
              </label>

              <select
                className="form-select"
                value={selectedFood}
                onChange={handleFoodChange}
              >
                <option value="">
                  Select food
                </option>

                {foods.map((food) => (
                  <option
                    key={food}
                    value={food}
                  >
                    {food}
                  </option>
                ))}
              </select>

              <small className="text-muted">
                If the AI prediction is incorrect,
                choose the correct food.
              </small>

            </div>

            {/* Quantity */}
            {selectedFood && (
              <div className="mt-3">

                <label className="form-label fw-bold">
                  Quantity
                </label>

                <div className="input-group">

                  <input
                    type="number"
                    className="form-control"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />

                  <span className="input-group-text">
                    {nutritionData[selectedFood]?.unit}
                  </span>

                </div>

                <small className="text-muted">
                  Enter the amount you consumed.
                </small>

              </div>
            )}

            {/* Nutrition */}
            {currentNutrition && (
              <div className="mt-3">

                <hr />

                <h6 className="fw-bold">
                  Nutrition Estimate
                </h6>

                <div className="row">

                  <div className="col-md-3">
                    <strong>
                      {currentNutrition.calories}
                    </strong>
                    <br />
                    <small>Calories</small>
                  </div>

                  <div className="col-md-3">
                    <strong>
                      {currentNutrition.protein}g
                    </strong>
                    <br />
                    <small>Protein</small>
                  </div>

                  <div className="col-md-3">
                    <strong>
                      {currentNutrition.carbs}g
                    </strong>
                    <br />
                    <small>Carbs</small>
                  </div>

                  <div className="col-md-3">
                    <strong>
                      {currentNutrition.fats}g
                    </strong>
                    <br />
                    <small>Fat</small>
                  </div>

                </div>

                {/* Log button */}
                <button
                  className="btn btn-primary mt-3"
                  onClick={confirmAndLog}
                  disabled={saving || saved}
                >
                  {saving
                    ? "Saving..."
                    : saved
                    ? "✓ Meal Logged"
                    : "Confirm & Log Meal"}
                </button>

              </div>
            )}

          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="alert alert-success mt-3">
            ✓ Meal successfully added to your calorie tracker.
          </div>
        )}

      </div>
    </div>
  );
}

export default FoodRecognition;