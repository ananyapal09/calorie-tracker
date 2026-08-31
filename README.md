
# CalorieTracker

A full-stack nutrition tracker that understands meals the way people actually describe them — type "2 eggs and toast" or upload a photo of your plate, and it works out the calories and macros automatically.

Built with the MERN stack, an LLM-based meal parser, and a CLIP-based food recognition service.

[Live Demo](#) · [Screenshots](#screenshots)

## What makes this different

Most fresher nutrition trackers stop at manual dropdown logging. This one:

- **Parses meals from plain text** — "2 eggs, 2 rotis and a bowl of dal" is turned into structured nutrition data via an LLM, no dropdowns to hunt through.
- **Recognizes food from photos** — a CLIP-based zero-shot image classifier, tested at **88.89% top-1 / 95.56% top-3 accuracy** across 15 food categories on 45 real test images.
- **Recommends meals that actually fit** — a scoring algorithm ranks meal suggestions against your *remaining* daily calories and macros (weighted: calories 40%, protein 25%, carbs 20%, fat 15%), not just a static list.
- **Rate-limits the AI endpoints** — LLM and image-classification calls cost money per request, so both are protected against abuse.

## Features

- 🔐 JWT authentication with hashed passwords and protected routes
- 📝 Natural-language meal logging via LLM parsing
- 📸 Food recognition from photos via CLIP (zero-shot, 15 categories)
- 🔥 Automatic calorie and macro calculation (protein, carbs, fat)
- 📊 Daily nutrition dashboard + 7-day calorie and macro trend charts
- 🥗 Goal-aware meal recommendations scored against remaining macros
- ⚖️ BMI calculator with BMR/TDEE-based daily targets
- 🌙 Light/dark theme and user settings
- 🚦 Rate-limited AI endpoints

## Tech Stack

**Frontend:** React, React Router, Bootstrap, Recharts, Font Awesome

**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Multer, express-rate-limit

**Food Recognition:** Python, CLIP (`openai/clip-vit-base-patch32`), zero-shot image classification against a custom food-label set built from the app's nutrition database.

## Architecture

```text
React Frontend
      │
      ├── POST /api/meals/parse
      │       └── LLM parses free-text meal → nutrition lookup
      │
      ├── POST /api/ai/parse-image
      │       └── Node backend → Python CLIP service
      │              → prediction → nutrition lookup
      │
      └── GET /api/meals/suggestions
              └── Goal-aware scoring against remaining macros

MongoDB
  └── Users
  └── Meals
  └── Nutrition data
````

## Food Recognition Accuracy

Evaluated on **45 real photos across 15 food categories** (3 images per class):

| Metric                   |             Result |
| ------------------------ | -----------------: |
| Top-1 accuracy           | **88.89% (40/45)** |
| Top-3 accuracy           | **95.56% (43/45)** |
| Categories at 100% top-1 |       **13 of 15** |

The main weak spot is **bread vs. toast** — visually similar categories that account for 4 of the 5 top-1 misses.

In 5 of those 6 bread/toast images, the correct label was still in the top-3. This is why low-confidence predictions fall back to a top-3 selection UI instead of forcing a single guess.

## Known Limitations / Roadmap

* Food recognition is limited to 15 categories — foods outside this list aren't recognized.
* No quantity/portion-size estimation from images yet (assumes standard serving).
* Bread/toast classification could improve with better label phrasing or fine-tuning.
* No automated test suite yet.
* Meal recommendation templates are a fixed set rather than generated combinations.

## Running Locally

### 1. Backend

```bash
cd backend
npm install
npm start
```

Runs on:

```text
http://localhost:5001
```

or your configured `PORT`.

### 2. Food Recognition Service

```bash
cd food-ai
pip install -r requirements.txt
python clip_service.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Runs on:

```text
http://localhost:3000
```

## Environment Variables

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
LLM_API_KEY=your_llm_api_key
```

**Never commit your `.env` file to GitHub.**

## Project Structure

```text
calorie-tracker/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── mealController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── Meal.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── mealRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   │   └── mealParser.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .gitignore
│
├── food-ai/
│   ├── clip_service.py
│   ├── food_predict.py
│   ├── test_accuracy.py
│   └── test_images/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BMI/
│   │   │   ├── FoodRecognition/
│   │   │   ├── Footer/
│   │   │   ├── MealCard/
│   │   │   ├── Navbar/
│   │   │   ├── ProtectedRoute/
│   │   │   └── Recommendation/
│   │   │
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── NotFound.jsx
│   │       ├── Settings.jsx
│   │       └── Signup.jsx
│   │
│   ├── package.json
│   └── ...
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Screenshots

### Home Page

<!-- Add home page screenshot here -->

### Dashboard

<!-- Add dashboard screenshot here -->

### Food Recognition

<!-- Add food recognition screenshot here -->

### Meal Recommendations

<!-- Add recommendations screenshot here -->



