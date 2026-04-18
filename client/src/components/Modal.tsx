import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  modalBackdropTransition,
  modalBackdropVariants,
  modalPanelTransition,
  modalPanelVariants,
} from "../lib/motionPresets";
import { cn } from "../lib/cn";
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
  /** e.g. z-[60] when stacked above another modal */
  overlayClassName?: string;
  panelClassName?: string;
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
  overlayClassName,
  panelClassName,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-overlay"
          role="presentation"
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:p-6",
            overlayClassName,
          )}
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={modalBackdropTransition}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="modal-title"
            className={cn(
              "app-scroll relative my-auto w-full max-w-md max-h-[min(90vh,100%)] overflow-y-auto rounded-2xl border border-border/90 bg-surface-900 p-5 shadow-[var(--shadow-elevated)] sm:p-6",
              panelClassName,
            )}
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={modalPanelTransition}
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
