import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const loc = useLocation();

  if (loading && !user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-muted">
        <Loader2 className="size-8 animate-spin text-accent" aria-hidden />
        <p className="text-sm">Loading your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  return <>{children}</>;
}
