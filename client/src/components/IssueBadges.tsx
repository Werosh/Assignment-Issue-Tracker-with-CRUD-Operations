import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";

const statusLabel: Record<IssueStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityLabel: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const severityLabel: Record<IssueSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const statusColor: Record<IssueStatus, string> = {
  open: "var(--status-open)",
  in_progress: "var(--status-progress)",
  resolved: "var(--status-resolved)",
  closed: "var(--status-closed)",
};

const priorityColor: Record<IssuePriority, string> = {
  low: "var(--priority-low)",
  medium: "var(--priority-medium)",
  high: "var(--priority-high)",
  urgent: "var(--priority-urgent)",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: `1px solid ${color}`,
        color,
        background: `${color}22`,
        fontFamily: "var(--font-mono)",
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge label={statusLabel[status]} color={statusColor[status]} />;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge label={priorityLabel[priority]} color={priorityColor[priority]} />;
}

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span
      style={{
        fontSize: "0.72rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
      }}
    >
      Sev: {severityLabel[severity]}
    </span>
  );
}
