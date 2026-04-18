import type { IssueStatus } from "../types/issue";

/** True when moving into resolved/closed from a different status (or creating as resolved/closed). */
export function needsResolveCloseConfirmation(
  nextStatus: IssueStatus,
  previousStatus: IssueStatus | undefined
): boolean {
  if (nextStatus !== "resolved" && nextStatus !== "closed") return false;
  if (previousStatus === undefined) return true;
  return previousStatus !== nextStatus;
}

export function resolveCloseModalTitle(pending: IssueStatus): string {
  if (pending === "resolved") return "Mark as resolved?";
  if (pending === "closed") return "Close this issue?";
  return "Update status?";
}

export function resolveCloseModalBody(pending: IssueStatus): string {
  if (pending === "resolved") {
    return "This sets the status to resolved. You can change it again anytime.";
  }
  if (pending === "closed") {
    return "Closed usually means no further work. You can reopen by changing status later.";
  }
  return "";
}

export function resolveCloseConfirmLabel(pending: IssueStatus): string {
  if (pending === "closed") return "Close issue";
  return "Mark resolved";
}
