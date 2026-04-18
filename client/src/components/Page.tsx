import type { ReactNode } from "react";

export function Page({ title, subtitle, actions, children }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "1.5rem 1.25rem 3rem" }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.65rem", letterSpacing: "-0.02em" }}>{title}</h1>
          {subtitle ? (
            <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)", maxWidth: "56ch" }}>{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
