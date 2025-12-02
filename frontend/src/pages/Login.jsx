import { useContext, useState } from "react";
import { AuthContext, useAuth } from "../context/AuthContext";
// Import `useLocation` to read the query parameters
import { useNavigate, useLocation, NavLink } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  // Use useLocation to get the current URL details
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    // --- 💡 Logic for Post-Login Redirection ---
    // 1. Get the `redirect` parameter from the URL's query string
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect");

    // 2. Navigate to the stored path, or default to /docs
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate("/docs");
    }
    // ------------------------------------------
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
        <button>Login with Google</button>
      </a>

      <NavLink to="/signup">Signup</NavLink>
    </div>
  );
}
