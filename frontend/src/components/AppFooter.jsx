// In components/AppFooter.jsx
import React from "react";
import "../styles/appFooter.css"; // We'll create this CSS

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} CollabNote. All rights reserved.
        </p>
        {/* Your personal branding line */}
        <p className="developer-credit">
          Designed by Ajay Meena, an awesome software engineer.
        </p>
      </div>
    </footer>
  );
}
