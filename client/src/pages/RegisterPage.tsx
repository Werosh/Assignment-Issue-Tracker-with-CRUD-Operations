import { useState } from "react";
import {
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineUser,
} from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
      subtitle="Use at least 8 characters for your password. Add a display name if you like."
      className="max-w-lg"
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
          className="space-y-1"
        >
          <Field label="Display name (optional)" icon={HiOutlineUser}>
            <Input name="name" autoComplete="nickname" onFocus={clearError} />
          </Field>
          <Field label="Email" icon={HiOutlineMail}>
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="Password" icon={HiOutlineLockClosed}>
            <Input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </Field>
          <div className="pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? "Creating…" : "Create account"}
            </Button>
          </div>
          <p className="mt-6! text-center text-sm text-muted sm:text-left">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent no-underline hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </Page>
  );
}
