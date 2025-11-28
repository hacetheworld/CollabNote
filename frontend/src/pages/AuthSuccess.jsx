import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api/api.service";

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    console.log(token, "token");

    if (token) {
      const secureLogin = async () => {
        try {
          localStorage.setItem("accessToken", token);
          const response = await getMe();

          const userProfile = response.user;

          loginWithGoogle(token, userProfile);
          navigate("/docs");
        } catch (error) {
          console.error(
            "Secure login completion failed (Profile fetch failed or token invalid):",
            error
          );

          // If anything fails, clear the token and redirect to login
          localStorage.removeItem("accessToken");
          navigate("/login", { replace: true });
        }
      };
      secureLogin();
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Logging you in...</p>;
}
