const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const mealRoutes = require("./routes/mealRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/meals", mealRoutes);



app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "CalorieTracker backend is running"
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });