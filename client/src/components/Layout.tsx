import { LayoutDashboard, LogIn, LogOut, UserPlus } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useAuthStore } from "../store/authStore";
import { cn } from "../lib/cn";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <Link to="/" className={cn("flex items-center gap-2.5 no-underline transition-opacity hover:opacity-90")}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
              <LayoutDashboard className="size-[1.15rem]" aria-hidden />
            </span>
            <span className="font-semibold tracking-tight text-foreground">
              Issue Tracker
              <span className="ml-2 text-[0.8rem] font-normal text-muted">workspace</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <span className="hidden max-w-[200px] truncate text-sm text-muted sm:inline">{user.name || user.email}</span>
                <Button
                  variant="ghost"
                  type="button"
                  className="gap-1.5 px-3 font-medium"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" type="button" className="gap-1.5 px-3 font-medium" onClick={() => navigate("/login")}>
                  <LogIn className="size-4" aria-hidden />
                  Sign in
                </Button>
                <Button variant="secondary" type="button" className="gap-1.5" onClick={() => navigate("/register")}>
                  <UserPlus className="size-4" aria-hidden />
                  Create account
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
