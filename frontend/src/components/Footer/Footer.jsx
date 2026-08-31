import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-2">© {new Date().getFullYear()} Calorie Tracker. All rights reserved.</p>
        <div className="mb-2">
          <a href="/" className="text-white me-3"><i className="fab fa-facebook-f"></i></a>
          <a href="/" className="text-white me-3"><i className="fab fa-twitter"></i></a>
          <a href="/" className="text-white me-3"><i className="fab fa-instagram"></i></a>
          <a href="/" className="text-white"><i className="fab fa-linkedin-in"></i></a>
        </div>
        <small className="text-muted">Built with 💪 React & Bootstrap</small>
      </div>
    </footer>
  );
}

export default Footer;
