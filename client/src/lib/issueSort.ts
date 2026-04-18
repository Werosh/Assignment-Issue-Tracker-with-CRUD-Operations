import type { Issue, IssuePriority, IssueSeverity } from "../types/issue";

/** Lower value = earlier in list (more urgent). */
const PRIORITY_ORDER: Record<IssuePriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Lower value = earlier (more severe). */
const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Sort issues for display: priority (urgent first), then severity (critical first),
 * then most recently updated first.
 */
export function compareIssuesByPrioritySeverityUpdated(a: Issue, b: Issue): number {
  const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (p !== 0) return p;
  const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  if (s !== 0) return s;
  const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
  const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
  return tb - ta;
}
