import { createContext, useState, useEffect, useContext } from "react";
import { loginApi, signupApi, getMe } from "../api/api.service";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("accessToken"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    localStorage.setItem("accessToken", res.data.accessToken);
    setUser(res.data.user);
  };
  const loginWithGoogle = (token, userObj) => {
    localStorage.setItem("accessToken", token);
    setUser(userObj);
  };
  const signup = async (data) => {
    const res = await signupApi(data);
    localStorage.setItem("accessToken", res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, loginWithGoogle, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
