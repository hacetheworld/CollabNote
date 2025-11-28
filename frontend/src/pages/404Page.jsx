// In pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
// Optional: If you use the AppFooter on all pages, include it here
import { AppFooter } from "../components/AppFooter";
import "../styles/notFound.css"; // Custom 404 styling

export default function NotFoundPage() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-content">
        <span className="error-code">404</span>
        <h1 className="error-headline">Page Not Found</h1>
        <p className="error-message">
          Oops! We couldn't find the page you were looking for. It might have
          been moved or deleted.
        </p>

        <div className="error-actions">
          <Link to="/docs" className="home-link">
            Go to Documents Dashboard
          </Link>
        </div>
      </div>
      <AppFooter /> {/* Include the consistent footer */}
    </div>
  );
}
