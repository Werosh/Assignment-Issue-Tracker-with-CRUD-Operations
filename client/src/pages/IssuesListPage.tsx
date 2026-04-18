import {
  Activity,
  AlertCircle,
  Archive,
  CheckCircle2,
  CircleDot,
  Columns3,
  FileJson,
  LayoutList,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaFileCsv } from "react-icons/fa6";
import { VscJson } from "react-icons/vsc";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { PriorityBadge, StatusBadge } from "../components/IssueBadges";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import * as issuesApi from "../api/issues";
import { useIssueStore } from "../store/issueStore";
import { cn } from "../lib/cn";
import { IssueBoard } from "../components/issues/IssueBoard";

function StatCard({
  label,
  value,
  accentClass,
  icon: Icon,
}: {
  label: string;
  value: number;
  accentClass: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="group flex min-w-0 flex-col gap-1 p-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.75rem] font-medium uppercase tracking-wider text-muted">{label}</span>
        <Icon className={cn("size-4 opacity-70 transition-opacity group-hover:opacity-100", accentClass)} aria-hidden />
      </div>
      <span className={cn("text-3xl font-bold tabular-nums tracking-tight", accentClass)}>{value}</span>
    </Card>
  );
}

export function IssuesListPage() {
  const navigate = useNavigate();
  const filters = useIssueStore((s) => s.filters);
  const setFilters = useIssueStore((s) => s.setFilters);
  const list = useIssueStore((s) => s.list);
  const stats = useIssueStore((s) => s.stats);
  const loading = useIssueStore((s) => s.loading);
  const statsLoading = useIssueStore((s) => s.statsLoading);
  const error = useIssueStore((s) => s.error);
  const loadIssues = useIssueStore((s) => s.loadIssues);
  const loadBoardIssues = useIssueStore((s) => s.loadBoardIssues);
  const loadStats = useIssueStore((s) => s.loadStats);
  const updateIssue = useIssueStore((s) => s.updateIssue);
  const setIssuesView = useIssueStore((s) => s.setIssuesView);

  const [qInput, setQInput] = useState(filters.q);
  const debouncedQ = useDebouncedValue(qInput, 320);
  const [view, setView] = useState<"list" | "board">("list");

  useEffect(() => {
    setIssuesView(view);
  }, [view, setIssuesView]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setFilters({ q: debouncedQ });
  }, [debouncedQ, setFilters]);

  useEffect(() => {
    if (view === "board") {
      void loadBoardIssues();
    } else {
      void loadIssues();
    }
  }, [
    view,
    loadIssues,
    loadBoardIssues,
    filters.page,
    filters.limit,
    filters.q,
    filters.status,
    filters.priority,
    filters.severity,
  ]);

  const exportDisabled = loading || statsLoading;

  const activeFilters = useMemo(
    () => ({
      q: filters.q || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      severity: filters.severity || undefined,
    }),
    [filters.q, filters.status, filters.priority, filters.severity]
  );

  return (
    <Page
      title="Issues"
      subtitle={
        view === "board"
          ? "Board view: drag cards by the handle to move between columns. Up to 200 issues load; search and filters still apply."
          : "Create, filter, and triage work in one place. Search pauses briefly while you type so the API is not called on every keystroke."
      }
      actions={
        <>
          <div className="flex rounded-lg border border-border bg-surface-900 p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                view === "list" ? "bg-surface-800 text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              <LayoutList className="size-4" aria-hidden />
              List
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                view === "board" ? "bg-surface-800 text-foreground shadow-sm" : "text-muted hover:text-foreground"
              )}
            >
              <Columns3 className="size-4" aria-hidden />
              Board
            </button>
          </div>
          <Button
            variant="secondary"
            type="button"
            disabled={exportDisabled}
            className="gap-2 font-medium"
            onClick={() => void issuesApi.downloadExport({ ...activeFilters, format: "csv" })}
          >
            <FaFileCsv className="size-4 text-accent" aria-hidden />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={exportDisabled}
            className="gap-2 font-medium"
            onClick={() => void issuesApi.downloadExport({ ...activeFilters, format: "json" })}
          >
            <VscJson className="size-4 text-muted" aria-hidden />
            Export JSON
          </Button>
          <Button variant="primary" type="button" className="gap-2 shadow-accent/25" onClick={() => navigate("/issues/new")}>
            <Plus className="size-4" aria-hidden />
            New issue
          </Button>
        </>
      }
    >
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open" value={stats?.open ?? 0} accentClass="text-accent" icon={CircleDot} />
        <StatCard label="In progress" value={stats?.in_progress ?? 0} accentClass="text-foreground" icon={Activity} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} accentClass="text-[#b8ff6a]" icon={CheckCircle2} />
        <StatCard label="Closed" value={stats?.closed ?? 0} accentClass="text-muted" icon={Archive} />
      </section>

      <Card className="mb-6 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Search title or description" icon={Search}>
            <Input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Keywords…"
              aria-label="Search issues"
            />
          </Field>
          <Field label="Status">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              aria-label="Filter by status"
              disabled={view === "board"}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            {view === "board" ? (
              <p className="mt-1.5 text-xs text-muted">Status filter is off in board view; use columns instead.</p>
            ) : null}
          </Field>
          <Field label="Priority">
            <Select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Severity">
            <Select
              value={filters.severity}
              onChange={(e) => setFilters({ severity: e.target.value })}
              aria-label="Filter by severity"
            >
              <option value="">All severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </Field>
        </div>
      </Card>

      {error ? (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
          Loading issues…
        </div>
      ) : null}

      {!loading && list && list.items.length === 0 && view === "list" ? (
        <p className="text-sm text-muted">No issues match your filters. Try adjusting search or create a new issue.</p>
      ) : null}

      {!loading && list && view === "board" ? (
        <div className="mt-4 flex min-h-[min(52vh,480px)] flex-1 flex-col lg:min-h-[min(58vh,620px)]">
          <IssueBoard
            issues={list.items}
            onStatusChange={async (issueId, status) => {
              await updateIssue(issueId, { status });
            }}
          />
        </div>
      ) : null}

      {view === "list" ? (
        <ul className="mt-4 grid list-none gap-3 p-0">
          {list?.items.map((issue) => (
            <li key={issue.id}>
              <Link
                to={`/issues/${issue.id}`}
                className="group block rounded-xl border border-border/90 bg-surface-850/50 p-4 no-underline shadow-sm transition-all hover:border-accent/40 hover:bg-surface-850 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
                    {issue.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[0.92rem] leading-relaxed text-muted">{issue.description}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent/90 opacity-0 transition-opacity group-hover:opacity-100">
                  <FileJson className="size-3.5" aria-hidden />
                  View details
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {view === "list" && list && list.totalPages > 1 ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="secondary"
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ page: filters.page - 1 })}
          >
            Previous
          </Button>
          <span className="px-2 text-sm text-muted">
            Page {list.page} of {list.totalPages}
            <span className="text-muted/70"> · {list.total} total</span>
          </span>
          <Button
            variant="secondary"
            type="button"
            disabled={filters.page >= list.totalPages}
            onClick={() => setFilters({ page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      ) : null}

      {view === "board" && list && list.total > 200 ? (
        <p className="mt-4 text-xs text-muted">Showing the first 200 issues for the board. Refine search or switch to list view for pagination.</p>
      ) : null}
    </Page>
  );
}
