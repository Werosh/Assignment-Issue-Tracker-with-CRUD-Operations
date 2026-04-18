import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect } from "react";
import {
  modalBackdropTransition,
  modalBackdropVariants,
  modalPanelTransition,
  modalPanelVariants,
} from "../lib/motionPresets";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

interface Props {
  open: boolean;
  onClose: () => void;
  view: "list" | "board";
  qInput: string;
  onQInputChange: (value: string) => void;
  status: string;
  priority: string;
  severity: string;
  setFilters: (patch: Partial<{ status: string; priority: string; severity: string }>) => void;
}

export function IssueFiltersModal({
  open,
  onClose,
  view,
  qInput,
  onQInputChange,
  status,
  priority,
  severity,
  setFilters,
}: Props) {
  useEffect(() => {
    if (!open) return;
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
          key="filters-modal"
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
            aria-labelledby="filters-modal-title"
            className="app-scroll relative my-auto w-full max-w-lg max-h-[min(90vh,100%)] overflow-y-auto rounded-2xl border border-border/90 bg-surface-900 p-5 shadow-[var(--shadow-elevated)] sm:p-6"
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
              aria-label="Close filters"
            >
              <X className="size-5" aria-hidden />
            </button>
            <div className="mb-5 flex items-center gap-2 pr-10">
              <SlidersHorizontal className="size-5 text-accent" aria-hidden />
              <h2 id="filters-modal-title" className="text-lg font-semibold tracking-tight text-foreground">
                Filters
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field label="Search title or description" icon={Search}>
                <Input
                  value={qInput}
                  onChange={(e) => onQInputChange(e.target.value)}
                  placeholder="Keywords…"
                  aria-label="Search issues"
                />
              </Field>
              <Field label="Status">
                <Select
                  value={status}
                  onChange={(e) => setFilters({ status: e.target.value })}
                  aria-label="Filter by status"
                  disabled={view === "board"}
                >
                  <option value="">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
                {view === "board" ? (
                  <p className="mt-1.5 text-xs text-muted">Status filter is off in board view; use columns instead.</p>
                ) : !status ? (
                  <p className="mt-1.5 text-xs text-muted">
                    All statuses shown in separate groups (up to 200 issues). Choose a status to filter the API and enable page navigation.
                  </p>
                ) : null}
              </Field>
              <Field label="Priority">
                <Select
                  value={priority}
                  onChange={(e) => setFilters({ priority: e.target.value })}
                  aria-label="Filter by priority"
                >
                  <option value="">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </Field>
              <Field label="Severity">
                <Select
                  value={severity}
                  onChange={(e) => setFilters({ severity: e.target.value })}
                  aria-label="Filter by severity"
                >
                  <option value="">All severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </Field>
            </div>
            <p className="mt-5 text-center text-xs text-muted">Changes apply as you edit. Press Esc or click outside to close.</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
