import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { IssueEditPage } from "./pages/IssueEditPage";
import { IssuesListPage } from "./pages/IssuesListPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuthStore } from "./store/authStore";

function AuthReady({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthReady>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <IssuesListPage />
                </ProtectedRoute>
              }
            />
            <Route path="/issues/new" element={<Navigate to="/?new=1" replace />} />
            <Route
              path="/issues/:id"
              element={
                <ProtectedRoute>
                  <IssueDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:id/edit"
              element={
                <ProtectedRoute>
                  <IssueEditPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthReady>
    </BrowserRouter>
  );
}
