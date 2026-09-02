import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "https://calorie-tracker-backend-r6e5.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Registration failed"
        );
      }

      console.log("Registration successful:", data);

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      // Don't store password in localStorage
      localStorage.removeItem("user");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      <h2 className="text-center mb-4">
        Sign Up
      </h2>

      {/* Error */}
      {error && (
        <div
          className="alert alert-danger mx-auto"
          style={{ maxWidth: "400px" }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          className="alert alert-success mx-auto"
          style={{ maxWidth: "400px" }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSignup}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >

        {/* Name */}
        <div className="mb-3">
          <label className="form-label">
            Name
          </label>

          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">
            Email address
          </label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength={6}
            required
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          <i className="fas fa-user-plus me-2"></i>

          {loading
            ? "Creating Account..."
            : "Sign Up"}
        </button>

      </form>
    </div>
  );
}

export default Signup;