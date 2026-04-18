import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const from = loc.state?.from || "/";
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [pending, setPending] = useState(false);

  return (
    <Page title="Sign in" subtitle="Welcome back. Use your email and password to continue.">
      {error ? (
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }} role="alert">
          {error}
        </p>
      ) : null}
      <form
        style={{ maxWidth: "400px" }}
        onSubmit={async (e) => {
          e.preventDefault();
          clearError();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "");
          const password = String(fd.get("password") ?? "");
          setPending(true);
          try {
            await login(email, password);
            navigate(from, { replace: true });
          } catch {
            /* error surfaced in store */
          } finally {
            setPending(false);
          }
        }}
      >
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" onFocus={clearError} />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" required autoComplete="current-password" minLength={8} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </Page>
  );
}
