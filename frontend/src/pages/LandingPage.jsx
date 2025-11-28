import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";
export default function LandingPage() {
  return (
    <div className="landing-page-wrapper">
      {/* --- Header/Navigation Bar --- */}
      <header className="landing-header">
        <div className="app-logo">CollabNote</div>
        <nav className="landing-nav">
          <Link to="/login" className="nav-login-btn">
            Login
          </Link>
          <Link to="/signup" className="nav-signup-btn">
            Get Started
          </Link>
        </nav>
      </header>

      {/* --- Hero Section --- */}
      <main className="hero-section">
        <div className="hero-content">
          {/* Main One-Liner */}
          <h1 className="hero-headline">Focus. Flow. Create Together.</h1>
          {/* Subtext */}
          <p className="hero-subtext">
            Real-time document collaboration, perfected for teams and
            individuals who demand clarity and speed.
          </p>

          {/* Call to Action Buttons */}
          <div className="hero-cta-group">
            <Link to="/signup" className="cta-button cta-primary">
              Start Collaborating Today
            </Link>
            <Link to="/login" className="cta-button cta-secondary">
              Login to Your Space
            </Link>
          </div>
        </div>

        {/* --- Image Placeholder (Optional visual element) --- */}
        <div className="hero-image-container">
          {/* Use a relevant image that conveys collaboration or a clean document UI */}
        </div>
      </main>

      {/* --- Features/About Section (Simplified) --- */}
      <section className="features-section">
        <div className="feature-card">
          <h3 className="feature-title">Instant Real-Time Sync</h3>
          <p className="feature-text">
            Zero latency collaboration means seeing changes the moment they
            happen.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Distraction-Free Design</h3>
          <p className="feature-text">
            A minimalist editor that lets you focus only on your content and
            ideas.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Secure & Simple Sharing</h3>
          <p className="feature-text">
            Share via 24-hour invite links with granular control over
            viewer/editor access.
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="landing-footer">
        <p>
          &copy; {new Date().getFullYear()} CollabNote. Built for efficiency.
        </p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
