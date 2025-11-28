import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait until auth finishes
  if (loading) return <div>Loading...</div>;

  // Check if login page has a redirect param
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get("redirect");

  if (isAuthenticated && !redirectParam) {
    // User is authenticated AND not deep-linked to a special redirect
    console.log("isAuthenticated +redirectParam ");

    return <Navigate to="/docs" replace />;
  }

  // Allow login/signup to render
  return <Outlet />;
};
