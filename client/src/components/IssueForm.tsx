import type { Issue, IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";

interface Props {
  initial?: Partial<Issue>;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    severity: IssueSeverity;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function IssueForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSubmit({
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      status: fd.get("status") as IssueStatus,
      priority: fd.get("priority") as IssuePriority,
      severity: fd.get("severity") as IssueSeverity,
    });
  }

  return (
    <form onSubmit={handle} style={{ maxWidth: "640px" }}>
      <Field label="Title">
        <Input
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title}
          autoComplete="off"
        />
      </Field>
      <Field label="Description">
        <Textarea name="description" required maxLength={10000} defaultValue={initial?.description} />
      </Field>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.5rem",
        }}
      >
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "open"}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>
        <Field label="Priority">
          <Select name="priority" defaultValue={initial?.priority ?? "medium"}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
        <Field label="Severity">
          <Select name="severity" defaultValue={initial?.severity ?? "medium"}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
