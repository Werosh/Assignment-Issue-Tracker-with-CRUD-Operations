import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const loc = useLocation();

  if (loading && !user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  return <>{children}</>;
}
