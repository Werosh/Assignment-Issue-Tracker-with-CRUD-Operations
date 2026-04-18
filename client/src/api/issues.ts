import { apiRequest } from "./http";
import type { Issue, IssueListResponse, IssueStats } from "../types/issue";

export interface IssueFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  priority?: string;
  severity?: string;
}

function toQuery(params: IssueFilters & { format?: string }): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") {
      sp.set(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function listIssues(filters: IssueFilters): Promise<IssueListResponse> {
  return apiRequest(`/api/issues${toQuery(filters)}`);
}

export async function getStats(): Promise<IssueStats> {
  return apiRequest("/api/issues/stats");
}

export async function getIssue(id: string): Promise<Issue> {
  return apiRequest(`/api/issues/${id}`);
}

export async function createIssue(body: Partial<Issue> & { title: string; description: string }) {
  return apiRequest<Issue>("/api/issues", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateIssue(id: string, body: Partial<Issue>) {
  return apiRequest<Issue>(`/api/issues/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteIssue(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/issues/${id}`, { method: "DELETE" });
}

export async function downloadExport(
  filters: IssueFilters & { format: "json" | "csv" }
): Promise<void> {
  const token = localStorage.getItem("auth_token");
  const q = toQuery({ ...filters, format: filters.format });
  const res = await fetch(`/api/issues/export${q}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `issues.${filters.format}`;
  a.click();
  URL.revokeObjectURL(url);
}
