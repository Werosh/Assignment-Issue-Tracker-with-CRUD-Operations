import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";
import { cn } from "../../lib/cn";
import { Input } from "./Input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const genId = useId();
  const inputId = id ?? genId;

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-850 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={0}
      >
        {visible ? (
          <EyeOff className="size-[1.15rem] shrink-0" aria-hidden />
        ) : (
          <Eye className="size-[1.15rem] shrink-0" aria-hidden />
        )}
      </button>
    </div>
  );
}
