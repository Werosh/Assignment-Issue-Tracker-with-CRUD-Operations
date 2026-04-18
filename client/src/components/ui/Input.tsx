import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        outline: "none",
        ...props.style,
      }}
    />
  );
}
