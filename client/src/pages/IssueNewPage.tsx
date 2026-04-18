import { AlertCircle } from "lucide-react";
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
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-100" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </div>
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
