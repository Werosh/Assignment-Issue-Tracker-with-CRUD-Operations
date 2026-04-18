import {
  ArrowLeft,
  CheckCircle2,
  DoorClosed,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Page } from "../components/Page";
import { PriorityBadge, SeverityBadge, StatusBadge } from "../components/IssueBadges";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
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
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          {issue.status !== "resolved" ? (
            <Button variant="secondary" type="button" disabled={pending} className="gap-2" onClick={() => setConfirmResolve(true)}>
              <CheckCircle2 className="size-4" aria-hidden />
              Resolve
            </Button>
          ) : null}
          {issue.status !== "closed" ? (
            <Button variant="secondary" type="button" disabled={pending} className="gap-2" onClick={() => setConfirmClose(true)}>
              <DoorClosed className="size-4" aria-hidden />
              Close
            </Button>
          ) : null}
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
        open={confirmResolve}
        title="Mark as resolved?"
        onClose={() => setConfirmResolve(false)}
        onConfirm={() =>
          run(async () => {
            await updateIssue(issue.id, { status: "resolved" });
            setConfirmResolve(false);
          })
        }
        confirmLabel="Mark resolved"
      >
        This sets the status to resolved. You can still reopen it by editing the issue later.
      </Modal>

      <Modal
        open={confirmClose}
        title="Close this issue?"
        onClose={() => setConfirmClose(false)}
        onConfirm={() =>
          run(async () => {
            await updateIssue(issue.id, { status: "closed" });
            setConfirmClose(false);
          })
        }
        confirmLabel="Close issue"
        danger
      >
        Closed issues are typically finished. You can change the status again from the editor if needed.
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
