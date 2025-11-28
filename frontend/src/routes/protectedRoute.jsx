import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Assume AuthContext provides { isAuthenticated: boolean }

/**
 * Checks if the user is logged in before rendering the requested page.
 */
export const ProtectedRoute = () => {
  // 1. Check Authentication Status
  const { loading, isAuthenticated } = useAuth();
  if (loading) {
    return <div>Loadingg.......</div>;
  }
  if (!isAuthenticated) {
    // Stop rendering the protected content and send the user to /login
    return <Navigate to="/login" replace />;
  }

  // 3. The Success Case
  // If the check passes, allow the nested route to be rendered.
  return <Outlet />;
};
