export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";
export type IssuePriority = "low" | "medium" | "high" | "urgent";
export type IssueSeverity = "low" | "medium" | "high" | "critical";

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdAt?: string;
  updatedAt?: string;
}

export interface IssueStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface IssueListResponse {
  items: Issue[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserPublic {
  id: string;
  email: string;
  name?: string;
}
