// In components/AppHeader.jsx
import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/appHeader.css"; // We'll create this CSS

export function AppHeader() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  // Closes the menu if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      console.warn("Logout function not provided.");
      localStorage.removeItem("accessToken");
      window.location.reload();
    }
  };

  return (
    <header className={`app-header `}>
      {/* --- Left Section: Logo --- */}
      <div className="header-left-section">
        {/* Logo links back to the documents page */}
        <NavLink to="/docs" className="app-logo">
          CollabNote
        </NavLink>
      </div>

      {/* --- Right Section: User Info and Dropdown --- */}
      <div className="header-right-section" ref={menuRef}>
        <span className="user-name-display">{user?.name}</span>

        {/* User Avatar Button */}
        <button
          className="user-avatar-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <img
            src={user?.avatar || "path/to/default/avatar.png"}
            alt={user?.name || "User Avatar"}
            className="user-avatar-lg"
          />
        </button>

        {/* Avatar Dropdown Menu */}
        {showMenu && (
          <div className="avatar-dropdown-menu">
            <button className="menu-item" onClick={handleLogout}>
              Logout
            </button>
            {/* Add more menu items here if needed */}
          </div>
        )}
      </div>
    </header>
  );
}
