import { X } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border/90 bg-surface-900 p-5 shadow-[var(--shadow-elevated)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        <h2 id="modal-title" className="pr-8 text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {children ? <div className="mb-5 mt-3 text-sm leading-relaxed text-muted">{children}</div> : null}
        <div className="flex justify-end gap-2">
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
