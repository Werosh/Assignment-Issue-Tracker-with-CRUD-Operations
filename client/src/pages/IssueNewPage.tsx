import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IssueForm } from "../components/IssueForm";
import { Page } from "../components/Page";
import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import { useIssueStore } from "../store/issueStore";

export function IssueNewPage() {
  const navigate = useNavigate();
  const createIssue = useIssueStore((s) => s.createIssue);
  const [error, setError] = useState<string | null>(null);

  return (
    <Page title="New issue" subtitle="Capture enough context that future-you knows what to do.">
      {error ? (
        <p style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      ) : null}
      <IssueForm
        submitLabel="Create issue"
        onCancel={() => navigate("/")}
        onSubmit={async (values) => {
          setError(null);
          try {
            const issue = await createIssue({
              title: values.title,
              description: values.description,
              status: values.status as IssueStatus,
              priority: values.priority as IssuePriority,
              severity: values.severity as IssueSeverity,
            });
            navigate(`/issues/${issue.id}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create issue.");
          }
        }}
      />
    </Page>
  );
}
