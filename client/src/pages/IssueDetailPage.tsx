import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { Page } from "../components/Page";
import { PriorityBadge, SeverityBadge, StatusBadge } from "../components/IssueBadges";
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
    return <Page title="Issue">Loading…</Page>;
  }

  if (error && !issue) {
    return (
      <Page title="Issue">
        <p style={{ color: "var(--danger)" }}>{error}</p>
        <Link to="/">Back to list</Link>
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
          <Button variant="secondary" type="button" disabled={pending} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
          {issue.status !== "resolved" ? (
            <Button variant="secondary" type="button" disabled={pending} onClick={() => setConfirmResolve(true)}>
              Mark resolved
            </Button>
          ) : null}
          {issue.status !== "closed" ? (
            <Button variant="secondary" type="button" disabled={pending} onClick={() => setConfirmClose(true)}>
              Close
            </Button>
          ) : null}
          <Button variant="primary" type="button" disabled={pending} onClick={() => navigate(`/issues/${issue.id}/edit`)}>
            Edit
          </Button>
        </>
      }
    >
      {error ? (
        <p style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
        <SeverityBadge severity={issue.severity} />
      </div>

      <article
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.65,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "1.1rem 1.25rem",
        }}
      >
        {issue.description}
      </article>

      <p style={{ marginTop: "1.25rem" }}>
        <Link to="/">← Back to issues</Link>
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
