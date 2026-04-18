import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IssueForm } from "../components/IssueForm";
import { Modal } from "../components/Modal";
import { Page } from "../components/Page";
import {
  needsResolveCloseConfirmation,
  resolveCloseConfirmLabel,
  resolveCloseModalBody,
  resolveCloseModalTitle,
} from "../lib/issueStatusConfirm";
import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import { useIssueStore } from "../store/issueStore";

type EditFormValues = {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
};

export function IssueEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadIssue = useIssueStore((s) => s.loadIssue);
  const updateIssue = useIssueStore((s) => s.updateIssue);
  const clearSelected = useIssueStore((s) => s.clearSelected);
  const issue = useIssueStore((s) => s.selectedIssue);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSubmit, setPendingSubmit] = useState<EditFormValues | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadIssue(id)
      .catch(() => setError("Could not load this issue."))
      .finally(() => setLoading(false));
    return () => clearSelected();
  }, [id, loadIssue, clearSelected]);

  if (!id) return null;

  if (loading) {
    return (
      <Page title="Edit issue">
        <p className="text-muted">Loading…</p>
      </Page>
    );
  }

  if (error || !issue) {
    return (
      <Page title="Edit issue">
        <p className="mb-4 text-danger">{error || "Issue not found."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-medium text-accent no-underline hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to list
        </Link>
      </Page>
    );
  }

  return (
    <Page title="Edit issue" subtitle="Adjust details and save when you are ready.">
      <Modal
        open={pendingSubmit != null}
        title={pendingSubmit ? resolveCloseModalTitle(pendingSubmit.status) : ""}
        danger={pendingSubmit?.status === "closed"}
        confirmLabel={pendingSubmit ? resolveCloseConfirmLabel(pendingSubmit.status) : "Confirm"}
        onClose={() => setPendingSubmit(null)}
        onConfirm={() => {
          const v = pendingSubmit;
          if (!v) return;
          setPendingSubmit(null);
          void (async () => {
            setError(null);
            try {
              await updateIssue(issue.id, {
                title: v.title,
                description: v.description,
                status: v.status,
                priority: v.priority,
                severity: v.severity,
              });
              navigate(`/?issue=${encodeURIComponent(issue.id)}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Update failed.");
            }
          })();
        }}
      >
        {pendingSubmit ? resolveCloseModalBody(pendingSubmit.status) : null}
      </Modal>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
          {error}
        </div>
      ) : null}
      <IssueForm
        initial={issue}
        submitLabel="Save changes"
        onCancel={() => navigate(`/?issue=${encodeURIComponent(issue.id)}`)}
        onSubmit={async (values) => {
          setError(null);
          const payload: EditFormValues = {
            title: values.title,
            description: values.description,
            status: values.status as IssueStatus,
            priority: values.priority as IssuePriority,
            severity: values.severity as IssueSeverity,
          };
          if (needsResolveCloseConfirmation(payload.status, issue.status)) {
            setPendingSubmit(payload);
            return;
          }
          try {
            await updateIssue(issue.id, payload);
            navigate(`/?issue=${encodeURIComponent(issue.id)}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Update failed.");
          }
        }}
      />
    </Page>
  );
}
