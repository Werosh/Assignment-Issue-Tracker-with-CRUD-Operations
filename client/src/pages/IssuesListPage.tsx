import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../components/Page";
import { PriorityBadge, StatusBadge } from "../components/IssueBadges";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import * as issuesApi from "../api/issues";
import { useIssueStore } from "../store/issueStore";

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      style={{
        flex: "1 1 140px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1rem 1.1rem",
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontSize: "1.65rem", fontWeight: 700, color: accent }}>{value}</div>
    </div>
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
  const loadStats = useIssueStore((s) => s.loadStats);

  const [qInput, setQInput] = useState(filters.q);
  const debouncedQ = useDebouncedValue(qInput, 320);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setFilters({ q: debouncedQ });
  }, [debouncedQ, setFilters]);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues, filters.page, filters.limit, filters.q, filters.status, filters.priority, filters.severity]);

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
      subtitle="Create, filter, and triage work in one place. Search waits briefly while you type to avoid extra requests."
      actions={
        <>
          <Button
            variant="secondary"
            type="button"
            disabled={exportDisabled}
            onClick={() => void issuesApi.downloadExport({ ...activeFilters, format: "csv" })}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={exportDisabled}
            onClick={() => void issuesApi.downloadExport({ ...activeFilters, format: "json" })}
          >
            Export JSON
          </Button>
          <Button variant="primary" type="button" onClick={() => navigate("/issues/new")}>
            New issue
          </Button>
        </>
      }
    >
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard label="Open" value={stats?.open ?? 0} accent="var(--status-open)" />
        <StatCard label="In progress" value={stats?.in_progress ?? 0} accent="var(--status-progress)" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} accent="var(--status-resolved)" />
        <StatCard label="Closed" value={stats?.closed ?? 0} accent="var(--status-closed)" />
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          alignItems: "end",
        }}
      >
        <Field label="Search title or description">
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Type to filter…"
            aria-label="Search issues"
          />
        </Field>
        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            aria-label="Filter by status"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>
        <Field label="Priority">
          <Select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
            aria-label="Filter by priority"
          >
            <option value="">All</option>
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
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>
      </div>

      {error ? (
        <p style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading issues…</p>
      ) : null}

      {!loading && list && list.items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No issues match your filters. Try adjusting search or create a new issue.</p>
      ) : null}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
        {list?.items.map((issue) => (
          <li key={issue.id}>
            <Link
              to={`/issues/${issue.id}`}
              style={{
                display: "block",
                padding: "1rem 1.1rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{issue.title}</div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>
              </div>
              <p
                style={{
                  margin: "0.55rem 0 0",
                  color: "var(--text-muted)",
                  fontSize: "0.92rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {issue.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {list && list.totalPages > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <Button
            variant="secondary"
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ page: filters.page - 1 })}
          >
            Previous
          </Button>
          <span style={{ alignSelf: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Page {list.page} of {list.totalPages} · {list.total} total
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
    </Page>
  );
}
