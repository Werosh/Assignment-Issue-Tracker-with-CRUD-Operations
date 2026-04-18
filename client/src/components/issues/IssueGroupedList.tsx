import { CalendarDays, ChevronDown, ChevronRight, CircleDot, Flag, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Issue, IssuePriority, IssueStatus, IssueSeverity } from "../../types/issue";
import { cn } from "../../lib/cn";

const STATUS_ORDER: IssueStatus[] = ["open", "in_progress", "resolved", "closed"];

const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "OPEN",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
  closed: "CLOSED",
};

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

function sortByUpdated(a: Issue, b: Issue) {
  const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
  const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
  return tb - ta;
}

function formatShortDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function initialsFromUser(name: string | undefined, email: string | undefined) {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return n.slice(0, 2).toUpperCase();
  }
  const local = email?.split("@")[0];
  if (local && local.length >= 2) return local.slice(0, 2).toUpperCase();
  return "?";
}

function PriorityCell({ priority }: { priority: IssuePriority }) {
  const label = PRIORITY_LABEL[priority];
  const isUrgent = priority === "urgent";
  const isHigh = priority === "high";
  return (
    <div className="flex items-center justify-end gap-1.5 text-right">
      <Flag
        className={cn(
          "size-3.5 shrink-0",
          isUrgent && "text-red-400",
          isHigh && "text-amber-400",
          priority === "medium" && "text-muted",
          priority === "low" && "text-muted/60"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "text-[0.8rem] font-medium",
          isUrgent && "text-red-300",
          isHigh && "text-amber-300/90",
          (priority === "medium" || priority === "low") && "text-muted"
        )}
      >
        {label}
      </span>
    </div>
  );
}

interface Props {
  issues: Issue[];
  /** Logged-in user — issues are scoped to the owner; shown as assignee on each row. */
  currentUser: { name?: string; email?: string } | null;
}

export function IssueGroupedList({ issues, currentUser }: Props) {
  const navigate = useNavigate();
  const assigneeInitials = initialsFromUser(currentUser?.name, currentUser?.email);
  const assigneeTitle = currentUser?.name?.trim() || currentUser?.email || "Account";

  const [open, setOpen] = useState<Record<IssueStatus, boolean>>({
    open: true,
    in_progress: true,
    resolved: true,
    closed: true,
  });

  const grouped = useMemo(() => {
    const map: Record<IssueStatus, Issue[]> = {
      open: [],
      in_progress: [],
      resolved: [],
      closed: [],
    };
    for (const i of issues) {
      if (map[i.status]) map[i.status].push(i);
    }
    for (const s of STATUS_ORDER) {
      map[s].sort(sortByUpdated);
    }
    return map;
  }, [issues]);

  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {STATUS_ORDER.map((status) => {
        const groupIssues = grouped[status];
        const expanded = open[status];
        const id = `issue-group-${status}`;
        return (
          <section
            key={status}
            className="overflow-hidden rounded-xl border border-border/90 bg-surface-900/40"
            aria-labelledby={`${id}-heading`}
          >
            <div className="flex items-center gap-2 border-b border-border/80 bg-surface-850/50 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                aria-expanded={expanded}
                aria-controls={id}
                onClick={() => setOpen((o) => ({ ...o, [status]: !o[status] }))}
              >
                {expanded ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
                <span className="sr-only">{expanded ? "Collapse" : "Expand"} {STATUS_LABEL[status]}</span>
              </button>
              <h2 id={`${id}-heading`} className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-wide text-foreground">
                <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-0.5 text-accent">
                  {STATUS_LABEL[status]}
                </span>
                <span className="font-mono text-[0.75rem] tabular-nums text-muted">{groupIssues.length}</span>
              </h2>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-accent"
                title="New issue"
                onClick={() => navigate("/issues/new")}
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>

            {expanded ? (
              <div
                id={id}
                className="max-h-[min(420px,48vh)] overflow-x-auto overflow-y-auto [-webkit-overflow-scrolling:touch]"
              >
                <table className="w-full min-w-[640px] border-collapse text-left text-[0.9rem]">
                  <thead>
                    <tr className="border-b border-border/80 bg-surface-950/80 text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      <th className="sticky top-0 z-10 bg-surface-950/95 px-3 py-2.5 pl-4 backdrop-blur-sm sm:px-4">Name</th>
                      <th className="sticky top-0 z-10 w-[120px] bg-surface-950/95 px-2 py-2.5 text-center backdrop-blur-sm">Assignee</th>
                      <th className="sticky top-0 z-10 w-[130px] bg-surface-950/95 px-2 py-2.5 backdrop-blur-sm">Updated</th>
                      <th className="sticky top-0 z-10 w-[120px] bg-surface-950/95 px-3 py-2.5 pr-4 text-right backdrop-blur-sm sm:pr-5">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupIssues.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                          No issues in this status.
                        </td>
                      </tr>
                    ) : (
                      groupIssues.map((issue) => (
                        <tr key={issue.id} className="border-b border-border/40 transition-colors last:border-b-0 hover:bg-white/3">
                          <td className="align-middle px-3 py-2.5 pl-4 sm:px-4">
                            <Link
                              to={`/issues/${issue.id}`}
                              className="group flex min-w-0 items-start gap-2.5 no-underline"
                            >
                              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface-800 text-muted">
                                <CircleDot className="size-3.5 text-accent/90" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-medium leading-snug text-foreground group-hover:text-accent">
                                  {issue.title}
                                </span>
                                <span className="mt-1 inline-flex flex-wrap gap-1.5">
                                  <span className="rounded-md border border-border/70 bg-surface-800/80 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted">
                                    {SEVERITY_LABEL[issue.severity]}
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="align-middle px-2 text-center">
                            <span
                              className="inline-flex size-8 items-center justify-center rounded-full border border-border/60 bg-surface-800 text-[0.7rem] font-semibold text-foreground"
                              title={assigneeTitle}
                            >
                              {assigneeInitials}
                            </span>
                          </td>
                          <td className="align-middle px-2 text-muted">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              <CalendarDays className="size-3.5 shrink-0 opacity-70" aria-hidden />
                              {formatShortDate(issue.updatedAt)}
                            </span>
                          </td>
                          <td className="align-middle px-3 py-2.5 pr-4 sm:pr-5">
                            <PriorityCell priority={issue.priority} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
