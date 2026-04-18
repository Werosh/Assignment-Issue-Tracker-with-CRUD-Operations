import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "1rem" }}>
      <span
        style={{
          display: "block",
          marginBottom: "0.35rem",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
