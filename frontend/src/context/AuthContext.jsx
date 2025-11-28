import { createContext, useState, useEffect, useContext } from "react";
import { loginApi, signupApi, getMe } from "../api/api.service";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Load token from localStorage on refresh
  console.log("inside the useAuth");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);

      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data.user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("yes i ran the cath of the getme");

        localStorage.removeItem("accessToken");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    localStorage.setItem("accessToken", res.data.accessToken);
    setUser(res.data.user);
    setIsAuthenticated(true);
    setLoading(false);
    console.log("from login function of authContext...");
  };
  const loginWithGoogle = (token, userObj) => {
    localStorage.setItem("accessToken", token);
    setUser(userObj);
    setIsAuthenticated(true);
    setLoading(false);
  };
  const signup = async (data) => {
    const res = await signupApi(data);
    localStorage.setItem("accessToken", res.data.accessToken);
    setUser(res.data.user);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
