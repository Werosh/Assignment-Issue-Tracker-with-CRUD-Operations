import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [pending, setPending] = useState(false);

  return (
    <Page
      title="Create account"
      subtitle="Password must be at least 8 characters. You can add a display name for the header."
    >
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
          const name = String(fd.get("name") ?? "").trim();
          setPending(true);
          try {
            await register(email, password, name || undefined);
            navigate("/", { replace: true });
          } catch {
            /* surfaced in store */
          } finally {
            setPending(false);
          }
        }}
      >
        <Field label="Display name (optional)">
          <Input name="name" autoComplete="nickname" onFocus={clearError} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" required autoComplete="new-password" minLength={8} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
        <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </Page>
  );
}
