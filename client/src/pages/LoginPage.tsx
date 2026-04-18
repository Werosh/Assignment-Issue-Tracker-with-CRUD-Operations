import { useState } from "react";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
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
    <Page
      title="Sign in"
      subtitle="Welcome back. Use your email and password to continue."
      className="mx-auto w-full max-w-lg"
    >
      <Card className="p-6 sm:p-8">
        {error ? (
          <div
            className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-100"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        <form
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
          className="space-y-1"
        >
          <Field label="Email" icon={HiOutlineMail}>
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              onFocus={clearError}
            />
          </Field>
          <Field label="Password" icon={HiOutlineLockClosed}>
            <PasswordInput
              name="password"
              required
              autoComplete="current-password"
              minLength={8}
              onFocus={clearError}
            />
          </Field>
          <div className="pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </div>
          <p className="mt-6! text-center text-sm text-muted sm:text-left">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-accent no-underline hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </Card>
    </Page>
  );
}
