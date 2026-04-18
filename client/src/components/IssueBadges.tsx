import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CircleDot,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { IssuePriority, IssueSeverity, IssueStatus } from "../types/issue";
import { cn } from "../lib/cn";

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

const statusIcon: Record<IssueStatus, LucideIcon> = {
  open: CircleDot,
  in_progress: Loader2,
  resolved: CheckCircle2,
  closed: Archive,
};

const statusUi: Record<IssueStatus, string> = {
  open: "border-accent/40 bg-accent/10 text-accent",
  in_progress: "border-foreground/25 bg-foreground/10 text-foreground",
  resolved: "border-accent/50 bg-accent/15 text-[#b8ff6a]",
  closed: "border-muted/50 bg-foreground/5 text-muted",
};

const priorityUi: Record<IssuePriority, string> = {
  low: "border-muted/50 bg-foreground/5 text-muted",
  medium: "border-accent/35 bg-accent/10 text-accent",
  high: "border-foreground/35 bg-foreground/10 text-foreground",
  urgent: "border-red-400/40 bg-red-500/10 text-red-200",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  const Icon = statusIcon[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide",
        statusUi[status]
      )}
    >
      <Icon
        className={cn("size-3.5 shrink-0", status === "in_progress" && "animate-spin")}
        aria-hidden
      />
      {statusLabel[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide",
        priorityUi[priority]
      )}
    >
      <AlertTriangle className="size-3 shrink-0 opacity-80" aria-hidden />
      {priorityLabel[priority]}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-surface-800/80 px-2 py-0.5 font-mono text-[0.68rem] text-muted">
      <span className="text-foreground/70">Sev</span>
      {severityLabel[severity]}
    </span>
  );
}
