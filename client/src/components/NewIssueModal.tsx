import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IssueForm } from "./IssueForm";
import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import {
  modalBackdropTransition,
  modalBackdropVariants,
  modalPanelTransition,
  modalPanelVariants,
} from "../lib/motionPresets";
import { useIssueStore } from "../store/issueStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewIssueModal({ open, onClose }: Props) {
  const createIssue = useIssueStore((s) => s.createIssue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="new-issue-modal"
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:p-6"
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
            aria-labelledby="new-issue-modal-title"
            className="app-scroll relative my-auto w-full max-w-4xl max-h-[min(90vh,100%)] overflow-y-auto rounded-2xl border border-border/90 bg-surface-900 p-5 shadow-[var(--shadow-elevated)] sm:p-6"
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
              <X className="size-5" aria-hidden />
            </button>
            <h2 id="new-issue-modal-title" className="pr-10 text-xl font-bold tracking-tight text-foreground">
              New issue
            </h2>
            <p className="mt-1 text-sm text-muted">Capture enough context that future-you knows what to do.</p>

            {error ? (
              <div
                className="mb-4 mt-4 flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-100"
                role="alert"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </div>
            ) : null}

            <div className="mt-5">
              <IssueForm
                embedInModal
                submitLabel="Create issue"
                onCancel={onClose}
                onSubmit={async (values) => {
                  setError(null);
                  try {
                    await createIssue({
                      title: values.title,
                      description: values.description,
                      status: values.status as IssueStatus,
                      priority: values.priority as IssuePriority,
                      severity: values.severity as IssueSeverity,
                    });
                    onClose();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not create issue.");
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
