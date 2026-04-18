import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IssueForm } from "../components/IssueForm";
import { Page } from "../components/Page";
import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import { useIssueStore } from "../store/issueStore";

export function IssueEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadIssue = useIssueStore((s) => s.loadIssue);
  const updateIssue = useIssueStore((s) => s.updateIssue);
  const clearSelected = useIssueStore((s) => s.clearSelected);
  const issue = useIssueStore((s) => s.selectedIssue);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <Page title="Edit issue">Loading…</Page>;
  }

  if (error || !issue) {
    return (
      <Page title="Edit issue">
        <p style={{ color: "var(--danger)" }}>{error || "Issue not found."}</p>
        <Link to="/">Back to list</Link>
      </Page>
    );
  }

  return (
    <Page title="Edit issue" subtitle="Adjust details and save when you are ready.">
      {error ? (
        <p style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      ) : null}
      <IssueForm
        initial={issue}
        submitLabel="Save changes"
        onCancel={() => navigate(`/issues/${issue.id}`)}
        onSubmit={async (values) => {
          setError(null);
          try {
            await updateIssue(issue.id, {
              title: values.title,
              description: values.description,
              status: values.status as IssueStatus,
              priority: values.priority as IssuePriority,
              severity: values.severity as IssueSeverity,
            });
            navigate(`/issues/${issue.id}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Update failed.");
          }
        }}
      />
    </Page>
  );
}
