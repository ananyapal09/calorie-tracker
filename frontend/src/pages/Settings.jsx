import React, { useEffect, useState } from "react";

function Settings() {
  const [profile, setProfile] = useState(null);

  const [calorieGoal, setCalorieGoal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://calorie-tracker-backend-r6e5.onrender.com/api/users/profile",
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
          data.error || "Failed to load profile"
        );
      }

      const user = data.user;

      setProfile(user);

      setCalorieGoal(user.calorieGoal ?? "");
      setProtein(user.macroGoals?.protein ?? "");
      setCarbs(user.macroGoals?.carbs ?? "");
      setFats(user.macroGoals?.fats ?? "");

    } catch (err) {
      console.error("Profile error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const calorieValue = Number(calorieGoal);
      const proteinValue = Number(protein);
      const carbsValue = Number(carbs);
      const fatsValue = Number(fats);

      if (
        calorieValue <= 0 ||
        proteinValue <= 0 ||
        carbsValue <= 0 ||
        fatsValue <= 0
      ) {
        throw new Error(
          "All nutrition goals must be greater than 0."
        );
      }

      console.log("SENDING GOALS:", {
        calorieGoal: calorieValue,
        protein: proteinValue,
        carbs: carbsValue,
        fats: fatsValue,
      });

      const response = await fetch(
        "https://calorie-tracker-backend-r6e5.onrender.com/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            calorieGoal: calorieValue,
            protein: proteinValue,
            carbs: carbsValue,
            fats: fatsValue,
          }),
        }
      );

      const data = await response.json();

      console.log("UPDATE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update goals"
        );
      }

      // Update React state with the value returned
      // from the DATABASE
      setProfile(data.user);

      setCalorieGoal(data.user.calorieGoal);
      setProtein(data.user.macroGoals.protein);
      setCarbs(data.user.macroGoals.carbs);
      setFats(data.user.macroGoals.fats);

      setSuccess(
        "Your nutrition goals were updated successfully."
      );

    } catch (err) {
      console.error("Update goals error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">
          Loading your settings...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h1 className="fw-bold">
          ⚙️ Nutrition Settings
        </h1>

        <p className="text-muted">
          Customize your daily calorie and macronutrient goals.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}

      {profile && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-1">
              {profile.name}
            </h4>

            <p className="text-muted mb-0">
              {profile.email}
            </p>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">

          <h4 className="fw-bold mb-1">
            🎯 Daily Nutrition Goals
          </h4>

          <p className="text-muted mb-4">
            These targets are used by your dashboard and meal recommendations.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Calories */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                🔥 Daily Calories
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={calorieGoal}
                  onChange={(e) =>
                    setCalorieGoal(e.target.value)
                  }
                  min="1"
                  required
                />

                <span className="input-group-text">
                  kcal
                </span>
              </div>
            </div>

            {/* Protein */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                💪 Protein
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={protein}
                  onChange={(e) =>
                    setProtein(e.target.value)
                  }
                  min="1"
                  step="0.1"
                  required
                />

                <span className="input-group-text">
                  g
                </span>
              </div>
            </div>

            {/* Carbs */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                🍞 Carbohydrates
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={carbs}
                  onChange={(e) =>
                    setCarbs(e.target.value)
                  }
                  min="1"
                  step="0.1"
                  required
                />

                <span className="input-group-text">
                  g
                </span>
              </div>
            </div>

            {/* Fats */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                🥑 Fats
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={fats}
                  onChange={(e) =>
                    setFats(e.target.value)
                  }
                  min="1"
                  step="0.1"
                  required
                />

                <span className="input-group-text">
                  g
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success px-4"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Nutrition Goals"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;