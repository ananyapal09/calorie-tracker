import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="container hero-grid">

          <div className="hero-copy">
            <p className="hero-kicker">Nutrition tracking, done properly</p>

            <h1 className="hero-title">
              Know exactly what's on your plate.
            </h1>

            <p className="hero-subtitle">
              Log meals by typing them normally, snap a photo, or search —
              CalorieTracker works out the calories and macros and shows
              you what to eat next to hit your goal.
            </p>

            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Get started
              </Link>
              <Link to="/dashboard" className="btn btn-ghost">
                View dashboard
              </Link>
            </div>

            <dl className="hero-stats">
              <div>
                <dt>Meals logged by typing</dt>
                <dd>"2 eggs and toast"</dd>
              </div>
              <div>
                <dt>Or by photo</dt>
                <dd>Instant recognition</dd>
              </div>
              <div>
                <dt>Recommendations</dt>
                <dd>Matched to your goal</dd>
              </div>
            </dl>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="label-panel">
              <p className="label-title">Today's progress</p>
              <div className="label-rule label-rule-thick"></div>

              <div className="label-row label-row-lg">
                <span>Calories remaining</span>
                <span className="label-value">1,279</span>
              </div>
              <div className="label-rule"></div>

              <div className="label-row">
                <span>Protein</span>
                <span className="label-value">62g <em>/ 100g</em></span>
              </div>
              <div className="label-row">
                <span>Carbs</span>
                <span className="label-value">140g <em>/ 250g</em></span>
              </div>
              <div className="label-row">
                <span>Fat</span>
                <span className="label-value">31g <em>/ 65g</em></span>
              </div>
              <div className="label-rule label-rule-thick"></div>

              <div className="label-row label-row-sm">
                <span>Goal</span>
                <span className="label-value">Maintain weight</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="features-section">
        <div className="container">

          <div className="section-heading">
            <h2>Three ways to stay on top of it</h2>
            <p>
              No dropdowns to hunt through. Log meals the way you'd
              actually describe them, and let the app do the arithmetic.
            </p>
          </div>

          <div className="feature-list">

            <Link to="/dashboard" className="feature-row">
              <div className="feature-row-head">
                <h3>Track calories</h3>
                <span className="feature-cta">Start tracking</span>
              </div>
              <p>
                Type a meal in plain language or upload a photo of your
                plate — it's parsed into calories, protein, carbs and fat
                automatically.
              </p>
            </Link>

            <Link to="/bmi" className="feature-row">
              <div className="feature-row-head">
                <h3>Check your BMI</h3>
                <span className="feature-cta">Calculate BMI</span>
              </div>
              <p>
                A quick, honest read on your weight category, used to set
                sensible calorie and macro targets from the start.
              </p>
            </Link>

            <Link to="/recommendations" className="feature-row">
              <div className="feature-row-head">
                <h3>Get meal recommendations</h3>
                <span className="feature-cta">Explore meals</span>
              </div>
              <p>
                See meals that actually fit what you have left today —
                ranked by how well they match your remaining calories and
                macros.
              </p>
            </Link>

          </div>
        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section">
        <div className="container">

          <div className="section-heading">
            <h2>Three steps, every day</h2>
            <p>Nothing to configure — just log, check, and adjust.</p>
          </div>

          <ol className="steps-list">
            <li className="step-item">
              <span className="step-number">01</span>
              <h3>Log your meals</h3>
              <p>
                Describe what you ate or upload a photo. It's turned into
                structured nutrition data in seconds.
              </p>
            </li>

            <li className="step-item">
              <span className="step-number">02</span>
              <h3>Check your progress</h3>
              <p>
                Your dashboard shows today's totals plus a 7-day trend, so
                you can see patterns, not just single days.
              </p>
            </li>

            <li className="step-item">
              <span className="step-number">03</span>
              <h3>Adjust with confidence</h3>
              <p>
                Recommendations update as you log, so the next meal always
                fits what you actually have left.
              </p>
            </li>
          </ol>

        </div>
      </section>


      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Start logging your first meal.</h2>
          <p>It takes about as long as typing what you just ate.</p>
          <Link to="/signup" className="btn btn-primary btn-on-dark">
            Get started
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;