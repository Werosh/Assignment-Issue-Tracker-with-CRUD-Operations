import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-sky-400 to-sky-600 text-slate-950 shadow-md shadow-sky-500/15 hover:from-sky-300 hover:to-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
  secondary:
    "border border-border bg-surface-800 text-foreground hover:bg-surface-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
  ghost:
    "border border-transparent text-muted hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
  danger:
    "bg-gradient-to-b from-red-400 to-red-600 text-slate-950 shadow-md shadow-red-500/10 hover:from-red-300 hover:to-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] px-4 py-2.5 text-[0.95rem] font-semibold transition-[opacity,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
