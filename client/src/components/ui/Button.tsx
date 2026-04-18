import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base: CSSProperties = {
  padding: "0.55rem 1rem",
  borderRadius: "var(--radius)",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  cursor: "pointer",
  border: "none",
  fontWeight: 600,
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)",
    color: "#0c0e12",
  },
  secondary: {
    background: "var(--bg-muted)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    fontWeight: 500,
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid transparent",
    fontWeight: 500,
  },
  danger: {
    background: "linear-gradient(180deg, #f87171 0%, #dc2626 100%)",
    color: "#0c0e12",
  },
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  style,
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      {...rest}
      style={{
        ...base,
        ...variants[variant],
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
