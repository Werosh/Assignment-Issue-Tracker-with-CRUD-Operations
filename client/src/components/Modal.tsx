import type { ReactNode } from "react";
import { Button } from "./ui/Button";

interface Props {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 50,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
        style={{
          width: "min(440px, 100%)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "1.25rem",
          boxShadow: "var(--shadow)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>
          {title}
        </h2>
        {children ? <div style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>{children}</div> : null}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
