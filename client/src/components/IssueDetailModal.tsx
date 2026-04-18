import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { PriorityBadge, SeverityBadge, StatusBadge } from "./IssueBadges";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Select } from "./ui/Select";
import type { IssueStatus } from "../types/issue";
import { useIssueStore } from "../store/issueStore";

interface Props {
  open: boolean;
  issueId: string | null;
  onClose: () => void;
}

export function IssueDetailModal({ open, issueId, onClose }: Props) {
  const navigate = useNavigate();
  const loadIssue = useIssueStore((s) => s.loadIssue);
  const updateIssue = useIssueStore((s) => s.updateIssue);
  const deleteIssue = useIssueStore((s) => s.deleteIssue);
  const clearSelected = useIssueStore((s) => s.clearSelected);
  const issue = useIssueStore((s) => s.selectedIssue);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [statusSelect, setStatusSelect] = useState<IssueStatus>("open");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<IssueStatus | null>(null);

  useEffect(() => {
    if (!open || !issueId) {
      return;
    }
    setError(null);
    setPending(true);
    loadIssue(issueId)
      .catch(() => setError("Could not load this issue."))
      .finally(() => setPending(false));
    return () => {
      clearSelected();
    };
  }, [open, issueId, loadIssue, clearSelected]);

  useEffect(() => {
    if (issue) {
      setStatusSelect(issue.status);
    }
  }, [issue?.status, issue?.id]);

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  function onStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as IssueStatus;
    if (next === "resolved" || next === "closed") {
      setPendingStatus(next);
      setConfirmStatus(true);
      return;
    }
    setStatusSelect(next);
    void run(async () => {
      await updateIssue(issue!.id, { status: next });
    });
  }

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
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

  if (!open || !issueId) return null;

  const statusModalTitle =
    pendingStatus === "resolved" ? "Mark as resolved?" : pendingStatus === "closed" ? "Close this issue?" : "Update status?";
  const statusModalBody =
    pendingStatus === "resolved"
      ? "This sets the status to resolved. You can change it again anytime below."
      : pendingStatus === "closed"
        ? "Closed usually means no further work. You can reopen by changing status here or on the edit screen."
        : "";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="issue-detail-modal-title"
        className="relative my-auto w-full max-w-4xl max-h-[min(90vh,100%)] overflow-y-auto rounded-2xl border border-border/90 bg-surface-900 p-5 shadow-[var(--shadow-elevated)] sm:p-6"
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

        {pending && !issue ? (
          <p className="pr-10 text-muted">Loading…</p>
        ) : error && !issue ? (
          <div className="pr-10">
            <p className="mb-4 text-danger">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to list
            </button>
          </div>
        ) : issue ? (
          <>
            <div className="pr-10">
              <h2 id="issue-detail-modal-title" className="text-xl font-bold tracking-tight text-foreground">
                {issue.title}
              </h2>
              {issue.updatedAt ? (
                <p className="mt-1 text-sm text-muted">Updated {new Date(issue.updatedAt).toLocaleString()}</p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-border/70 pb-4">
              <Button variant="ghost" type="button" disabled={pending} className="gap-2 text-red-300 hover:text-red-200" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" aria-hidden />
                Delete
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={pending}
                className="gap-2"
                onClick={() => {
                  onClose();
                  navigate(`/issues/${issue.id}/edit`);
                }}
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            </div>

            {error ? (
              <div className="mb-4 mt-4 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
                {error}
              </div>
            ) : null}

            <div className="mb-4 mt-4 flex flex-wrap gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <SeverityBadge severity={issue.severity} />
            </div>

            <Card className="mb-5 p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Status</h3>
              <p className="mb-3 text-sm text-muted">Set the workflow state anytime. Resolving or closing asks for confirmation.</p>
              <Field label="Current status">
                <Select value={statusSelect} disabled={pending} onChange={onStatusChange} aria-label="Issue status">
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </Field>
            </Card>

            <Card className="p-5 sm:p-6">
              <article className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground/95">{issue.description}</article>
            </Card>

            <p className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-[#b8ff6a] hover:underline"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back to issues
              </button>
            </p>

            <Modal
              open={confirmStatus && pendingStatus != null}
              title={statusModalTitle}
              onClose={() => {
                setConfirmStatus(false);
                setPendingStatus(null);
                setStatusSelect(issue.status);
              }}
              onConfirm={() =>
                run(async () => {
                  if (!pendingStatus) return;
                  await updateIssue(issue.id, { status: pendingStatus });
                  setStatusSelect(pendingStatus);
                  setConfirmStatus(false);
                  setPendingStatus(null);
                })
              }
              confirmLabel={pendingStatus === "closed" ? "Close issue" : "Mark resolved"}
              danger={pendingStatus === "closed"}
            >
              {statusModalBody}
            </Modal>

            <Modal
              open={confirmDelete}
              title="Delete issue?"
              onClose={() => setConfirmDelete(false)}
              onConfirm={() =>
                run(async () => {
                  await deleteIssue(issue.id);
                  setConfirmDelete(false);
                  onClose();
                })
              }
              confirmLabel="Delete"
              danger
            >
              This permanently removes the issue from your workspace.
            </Modal>
          </>
        ) : null}
      </div>
    </div>
  );
}
