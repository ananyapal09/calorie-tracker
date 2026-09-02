import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import MealCard from "../components/MealCard/MealCard";
import FoodRecognition from "../components/FoodRecognition/FoodRecognition";
import Recommendation from "../components/Recommendation/Recommendation";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [todayResponse, weeklyResponse] = await Promise.all([
        fetch("https://calorie-tracker-backend-r6e5.onrender.com/api/meals/summary/today", {
          method: "GET",
          headers,
        }),

        fetch("https://calorie-tracker-backend-r6e5.onrender.com/api/meals/summary/weekly", {
          method: "GET",
          headers,
        }),
      ]);

      // Authentication expired
      if (
        todayResponse.status === 401 ||
        weeklyResponse.status === 401
      ) {
        localStorage.removeItem("token");
        throw new Error("Authentication expired. Please login again.");
      }

      if (!todayResponse.ok || !weeklyResponse.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const todayData = await todayResponse.json();
      const weeklyData = await weeklyResponse.json();

      console.log("Today's data:", todayData);
      console.log("Weekly data:", weeklyData);

      setSummary(todayData);
      setWeekly(weeklyData);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchDashboard();
  }, []);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">
          Loading your nutrition dashboard...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (!summary || !weekly) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Unable to load dashboard data.
        </div>
      </div>
    );
  }

  // =========================
  // CHART DATA
  // =========================
  const chartData = weekly.days.map((day) => ({
    ...day,
    label: new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  // =========================
  // UI
  // =========================
  return (
    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}
      <div className="mb-4">
        <h1 className="fw-bold">
          Nutrition Dashboard
        </h1>

        <p className="text-muted mb-0">
          Track your daily nutrition and understand your eating patterns.
        </p>
      </div>


      {/* =========================
          TODAY'S SUMMARY
      ========================= */}
      <div className="row g-3 mb-4">

        {/* Calories */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <p className="text-muted mb-1">
                🔥 Calories
              </p>

              <h2 className="fw-bold mb-0">
                {summary.calories}
              </h2>

              <small className="text-muted">
                kcal today
              </small>

            </div>
          </div>
        </div>


        {/* Protein */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <p className="text-muted mb-1">
                💪 Protein
              </p>

              <h2 className="fw-bold mb-0">
                {Number(summary.protein).toFixed(1)}g
              </h2>

              <small className="text-muted">
                today
              </small>

            </div>
          </div>
        </div>


        {/* Carbs */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <p className="text-muted mb-1">
                🍞 Carbs
              </p>

              <h2 className="fw-bold mb-0">
                {Number(summary.carbs).toFixed(1)}g
              </h2>

              <small className="text-muted">
                today
              </small>

            </div>
          </div>
        </div>


        {/* Fats */}
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">

              <p className="text-muted mb-1">
                🥑 Fats
              </p>

              <h2 className="fw-bold mb-0">
                {Number(summary.fats).toFixed(1)}g
              </h2>

              <small className="text-muted">
                today
              </small>

            </div>
          </div>
        </div>

      </div>


      {/* =========================
          RECOMMENDATIONS
      ========================= */}
      <Recommendation />


      {/* =========================
          WEEKLY CALORIE TREND
      ========================= */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="mb-3">

            <h5 className="fw-bold mb-1">
              Weekly Calorie Trend
            </h5>

            <p className="text-muted small mb-0">
              Your calorie intake over the last 7 days.
            </p>

          </div>


          <div
            style={{
              width: "100%",
              height: 320,
            }}
          >

            <ResponsiveContainer>

              <LineChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="label" />

                <YAxis />

                <Tooltip
                  formatter={(value) => [
                    `${value} kcal`,
                    "Calories",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#198754"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>
      </div>


      {/* =========================
          WEEKLY MACRONUTRIENTS
      ========================= */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="mb-3">

            <h5 className="fw-bold mb-1">
              Weekly Macronutrients
            </h5>

            <p className="text-muted small mb-0">
              Protein, carbohydrates and fats consumed each day.
            </p>

          </div>


          <div
            style={{
              width: "100%",
              height: 320,
            }}
          >

            <ResponsiveContainer>

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="label" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="protein"
                  name="Protein (g)"
                  fill="#0d6efd"
                />

                <Bar
                  dataKey="carbs"
                  name="Carbs (g)"
                  fill="#ffc107"
                />

                <Bar
                  dataKey="fats"
                  name="Fats (g)"
                  fill="#dc3545"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>
      </div>


      {/* =========================
          TODAY'S STATUS
      ========================= */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <h5 className="fw-bold">
            Today's Nutrition
          </h5>

          <div className="row mt-3">

            <div className="col-md-4">

              <p className="text-muted mb-1">
                Meals logged
              </p>

              <h4>
                {summary.mealCount}
              </h4>

            </div>


            <div className="col-md-4">

              <p className="text-muted mb-1">
                Calories
              </p>

              <h4>
                {summary.calories} kcal
              </h4>

            </div>


            <div className="col-md-4">

              <p className="text-muted mb-1">
                Date
              </p>

              <h4>
                {new Date(summary.date).toLocaleDateString()}
              </h4>

            </div>

          </div>

        </div>
      </div>


      {/* =========================
          MEAL CARD
          IMPORTANT: pass refresh function
      ========================= */}
      <MealCard onMealAdded={fetchDashboard} />


      {/* =========================
          FOOD RECOGNITION
      ========================= */}
      <FoodRecognition onMealAdded={fetchDashboard} />

    </div>
  );
}

export default Dashboard;