import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthSuccess from "./pages/AuthSuccess";
import { AuthProvider } from "./context/AuthContext";
import DocsPage from "./pages/DocsPage";
import EditorPage from "./pages/EditorPage";
import { ProtectedRoute } from "./routes/protectedRoute";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import LandingPage from "./pages/LandingPage";
import { PublicRoute } from "./routes/publicRoute";
import NotFoundPage from "./pages/404Page";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/invite/accept/:token" element={<AcceptInvitePage />} />
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/:id" element={<EditorPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
