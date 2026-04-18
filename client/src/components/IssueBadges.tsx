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
  open: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  in_progress: "border-violet-400/40 bg-violet-500/10 text-violet-200",
  resolved: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  closed: "border-slate-500/50 bg-slate-500/10 text-slate-300",
};

const priorityUi: Record<IssuePriority, string> = {
  low: "border-slate-500/50 bg-slate-500/5 text-slate-300",
  medium: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  high: "border-orange-400/40 bg-orange-500/10 text-orange-200",
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
