import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-4">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-outline-primary mt-3">
        <i className="fas fa-home me-2"></i>Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
