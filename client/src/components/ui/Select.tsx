import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        cursor: "pointer",
        ...props.style,
      }}
    />
  );
}
