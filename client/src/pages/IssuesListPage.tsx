import {
  Activity,
  AlertCircle,
  Archive,
  CheckCircle2,
  CircleDot,
  Columns3,
  Filter,
  LayoutList,
  Loader2,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileCsv } from "react-icons/fa6";
import { VscJson } from "react-icons/vsc";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IssueFiltersModal } from "../components/IssueFiltersModal";
import { Page } from "../components/Page";
import { Button } from "../components/ui/Button";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import * as issuesApi from "../api/issues";
import { useIssueStore } from "../store/issueStore";
import { cn } from "../lib/cn";
import { IssueBoard } from "../components/issues/IssueBoard";
import { IssueGroupedList } from "../components/issues/IssueGroupedList";
import { NewIssueModal } from "../components/NewIssueModal";

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
    <div className="group flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-surface-850/50 px-2.5 py-2 transition-colors hover:border-border hover:bg-surface-850/80 sm:gap-2.5 sm:px-3 sm:py-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface-900/80">
        <Icon className={cn("size-3.5", accentClass)} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted">{label}</div>
        <div className={cn("text-lg font-bold tabular-nums leading-none sm:text-xl", accentClass)}>{value}</div>
      </div>
    </div>
  );
}

export function IssuesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewIssueModal = searchParams.get("new") === "1";
  const closeNewIssueModal = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);
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
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (qInput.trim()) n += 1;
    if (filters.status) n += 1;
    if (filters.priority) n += 1;
    if (filters.severity) n += 1;
    return n;
  }, [qInput, filters.status, filters.priority, filters.severity]);

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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <Page
      title="Issues"
      subtitle={
        view === "board"
          ? "Board view: drag cards by the handle to move between columns. Up to 200 issues load; search and filters still apply."
          : "List view groups issues by status in scrollable sections. With no status filter, up to 200 recently updated issues load. Search debounces so the API is not called on every keystroke."
      }
      stickyFooter={
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          <StatCard label="Open" value={stats?.open ?? 0} accentClass="text-accent" icon={CircleDot} />
          <StatCard label="In progress" value={stats?.in_progress ?? 0} accentClass="text-foreground" icon={Activity} />
          <StatCard label="Resolved" value={stats?.resolved ?? 0} accentClass="text-[#b8ff6a]" icon={CheckCircle2} />
          <StatCard label="Closed" value={stats?.closed ?? 0} accentClass="text-muted" icon={Archive} />
        </section>
      }
      actions={
        <>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setFiltersModalOpen(true)}
              className={cn(
                "relative flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-900 text-muted transition-colors hover:border-accent/35 hover:bg-surface-800 hover:text-foreground",
                activeFilterCount > 0 && "border-accent/25 text-accent"
              )}
              aria-label={
                activeFilterCount > 0 ? `Open filters, ${activeFilterCount} active` : "Open filters"
              }
            >
              <Filter className="size-[1.15rem]" strokeWidth={2.25} aria-hidden />
              {activeFilterCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold leading-none text-on-accent">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
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
          <Button variant="primary" type="button" className="gap-2 shadow-accent/25" onClick={() => navigate("/?new=1")}>
            <Plus className="size-4" aria-hidden />
            New issue
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {error ? (
          <div
            className="shrink-0 flex items-start gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="shrink-0 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
            Loading issues…
          </div>
        ) : null}

        {!loading && list && list.items.length === 0 && view === "list" ? (
          <p className="shrink-0 text-sm text-muted">No issues match your filters. Try adjusting search or create a new issue.</p>
        ) : null}

        {!loading && list && view === "board" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden">
              <IssueBoard
                issues={list.items}
                onStatusChange={async (issueId, status) => {
                  await updateIssue(issueId, { status });
                }}
              />
            </div>
            {list.total > 200 ? (
              <p className="shrink-0 text-xs text-muted">
                Showing the first 200 issues for the board. Refine search or switch to list view for pagination.
              </p>
            ) : null}
          </div>
        ) : null}

        {view === "list" && list && list.items.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <IssueGroupedList issues={list.items} />
          </div>
        ) : null}

        {view === "list" && list && !filters.status && list.total > 200 ? (
          <p className="shrink-0 text-xs text-muted">
            Showing the 200 most recently updated issues across all groups. Refine search or filter by status for paginated results.
          </p>
        ) : null}

        {view === "list" && list && filters.status && list.totalPages > 1 ? (
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 pt-4">
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
      </div>
    </Page>
    <NewIssueModal open={isNewIssueModal} onClose={closeNewIssueModal} />
    <IssueFiltersModal
      open={filtersModalOpen}
      onClose={() => setFiltersModalOpen(false)}
      view={view}
      qInput={qInput}
      onQInputChange={setQInput}
      status={filters.status}
      priority={filters.priority}
      severity={filters.severity}
      setFilters={setFilters}
    />
    </div>
  );
}
