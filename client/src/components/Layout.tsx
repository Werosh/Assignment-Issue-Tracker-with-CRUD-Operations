import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useAuthStore } from "../store/authStore";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(12, 14, 18, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "0.9rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            <span style={{ fontWeight: 700, letterSpacing: "-0.03em" }}>Issue Tracker</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500, marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              workspace
            </span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user ? (
              <>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Button variant="secondary" onClick={() => navigate("/register")}>
                  Create account
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
