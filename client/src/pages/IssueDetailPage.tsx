import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Page } from "../components/Page";
import { PriorityBadge, SeverityBadge, StatusBadge } from "../components/IssueBadges";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Select } from "../components/ui/Select";
import type { IssueStatus } from "../types/issue";
import { useIssueStore } from "../store/issueStore";

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
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
    if (!id) return;
    setError(null);
    setPending(true);
    loadIssue(id)
      .catch(() => setError("Could not load this issue."))
      .finally(() => setPending(false));
    return () => {
      clearSelected();
    };
  }, [id, loadIssue, clearSelected]);

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

  if (!id) {
    return null;
  }

  if (pending && !issue) {
    return (
      <Page title="Issue">
        <p className="text-muted">Loading…</p>
      </Page>
    );
  }

  if (error && !issue) {
    return (
      <Page title="Issue">
        <p className="mb-4 text-danger">{error}</p>
        <Link to="/" className="inline-flex items-center gap-2 font-medium text-accent no-underline hover:underline">
          <ArrowLeft className="size-4" aria-hidden />
          Back to list
        </Link>
      </Page>
    );
  }

  if (!issue) {
    return null;
  }

  const statusModalTitle =
    pendingStatus === "resolved" ? "Mark as resolved?" : pendingStatus === "closed" ? "Close this issue?" : "Update status?";
  const statusModalBody =
    pendingStatus === "resolved"
      ? "This sets the status to resolved. You can change it again anytime below."
      : pendingStatus === "closed"
        ? "Closed usually means no further work. You can reopen by changing status here or on the edit screen."
        : "";

  return (
    <Page
      title={issue.title}
      subtitle={issue.updatedAt ? `Updated ${new Date(issue.updatedAt).toLocaleString()}` : undefined}
      actions={
        <>
          <Button variant="ghost" type="button" disabled={pending} className="gap-2 text-red-300 hover:text-red-200" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
          <Button variant="primary" type="button" disabled={pending} className="gap-2" onClick={() => navigate(`/issues/${issue.id}/edit`)}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
        <SeverityBadge severity={issue.severity} />
      </div>

      <Card className="mb-5 p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Status</h2>
        <p className="mb-3 text-sm text-muted">Set the workflow state anytime. Resolving or closing asks for confirmation.</p>
        <Field label="Current status">
          <Select
            value={statusSelect}
            disabled={pending}
            onChange={onStatusChange}
            aria-label="Issue status"
          >
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent no-underline transition-colors hover:text-sky-300 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to issues
        </Link>
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
            navigate("/");
          })
        }
        confirmLabel="Delete"
        danger
      >
        This permanently removes the issue from your workspace.
      </Modal>
    </Page>
  );
}
