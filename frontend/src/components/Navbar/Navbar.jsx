import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Navbar.css";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = isDarkMode
      ? "bg-dark text-white"
      : "bg-light text-dark";

    localStorage.setItem(
      "theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);

    navigate("/");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg site-navbar ${
        isDarkMode ? "theme-dark" : "theme-light"
      }`}
    >
      <div className="container">

        <Link className="navbar-brand site-brand" to="/">
          <i className="fas fa-dumbbell me-2"></i>
          CalorieTracker
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNavAltMarkup"
        >
          <div className="navbar-nav ms-auto align-items-lg-center">

            <NavLink className="nav-link site-link" to="/">
              <i className="fas fa-home me-1"></i>
              Home
            </NavLink>

            <NavLink className="nav-link site-link" to="/dashboard">
              <i className="fas fa-chart-line me-1"></i>
              Dashboard
            </NavLink>

            {isLoggedIn ? (
              <div className="d-flex align-items-center site-auth-group">

                <span className="me-3 site-status">
                  <i className="fas fa-user-circle"></i>{" "}
                  Logged in
                </span>

                <button
                  className="btn site-btn-logout"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </button>

              </div>
            ) : (
              <>
                <NavLink
                  className="nav-link site-link"
                  to="/login"
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </NavLink>

                <NavLink
                  className="nav-link site-link"
                  to="/signup"
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Signup
                </NavLink>
              </>
            )}

<NavLink
  to="/settings"
  className="nav-link site-link"
>
  <i className="fas fa-cog me-1"></i>
  Settings
</NavLink>


<button
  className="btn btn-sm site-theme-toggle ms-2"
  onClick={toggleTheme}
  title="Toggle Theme"
>
  <i
    className={`fas ${
      isDarkMode ? "fa-sun" : "fa-moon"
    }`}
  ></i>
</button>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;