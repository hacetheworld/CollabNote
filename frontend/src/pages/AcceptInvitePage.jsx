import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { acceptInviteApi } from "../api/api.service.js";
// Assume you can get the login status here
import { useAuth } from "../context/AuthContext.jsx";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth(); // Assume this hook provides the auth status
  console.log(isAuthenticated, "isAuthenticated", loading, "loading");

  useEffect(() => {
    if (loading) {
      return;
    }
    // 1. Check Authentication Status

    if (!isAuthenticated) {
      // User is NOT logged in. Redirect to Login/Signup, storing the current URL.
      const currentPath = `/invite/accept/${token}`;

      // We redirect them to login, passing the current path as a query parameter.
      // After they log in, they will be sent back here to complete the acceptance.
      return navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }

    async function accept() {
      // 2. User IS logged in, proceed to accept the invite.
      try {
        const res = await acceptInviteApi(token);
        // Success: Redirect to the document
        console.log(res, "res");

        navigate(`/docs/${res.data.invite.documentId}`);
      } catch (e) {
        console.error("Invite accepting error:", e);

        // Handle error (e.g., expired, invalid, already accepted)
        // You might want a better UX than just redirecting to home.
        // navigate("/docs");
      }
    }
    accept();
  }, [token, isAuthenticated, navigate, loading]); // Dependencies for useEffect
  return (
    <div className="h-screen flex justify-center items-center">
      <h1 className="text-xl font-semibold">
        {isAuthenticated ? "Accepting Invite..." : "Checking account access..."}
      </h1>
    </div>
  );
}
