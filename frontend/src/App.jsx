import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthSuccess from "./pages/AuthSuccess";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/" element={<div>Home (Docs later)</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
