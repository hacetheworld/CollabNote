import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
// Import `useLocation` to read the query parameters
import { useNavigate, useLocation, NavLink } from "react-router-dom";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  // Use useLocation to get the current URL details
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form);

    // --- 💡 Logic for Post-Signup Redirection ---
    // 1. Get the `redirect` parameter from the URL's query string
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get("redirect");

    // 2. Navigate to the stored path, or default to /docs (assuming root is home)
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate("/docs");
    }
    // ------------------------------------------
  };

  return (
    <div className="container">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button>Create Account</button>
        <NavLink to="/login">Signin</NavLink>
      </form>
    </div>
  );
}
