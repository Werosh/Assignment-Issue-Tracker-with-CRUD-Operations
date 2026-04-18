import { create } from "zustand";
import type { Issue, IssueListResponse, IssueStats } from "../types/issue";
import * as issuesApi from "../api/issues";

interface FilterState {
  q: string;
  status: string;
  priority: string;
  severity: string;
  page: number;
  limit: number;
}

interface IssueStoreState {
  list: IssueListResponse | null;
  stats: IssueStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  filters: FilterState;
  selectedIssue: Issue | null;
  setFilters: (patch: Partial<FilterState>) => void;
  loadStats: () => Promise<void>;
  loadIssues: () => Promise<void>;
  /** Loads up to 200 issues across all statuses (for Kanban board). Respects search, priority, severity; ignores status filter and pagination. */
  loadBoardIssues: () => Promise<void>;
  loadIssue: (id: string) => Promise<Issue>;
  createIssue: (input: Parameters<typeof issuesApi.createIssue>[0]) => Promise<Issue>;
  updateIssue: (id: string, patch: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  clearSelected: () => void;
}

const defaultFilters: FilterState = {
  q: "",
  status: "",
  priority: "",
  severity: "",
  page: 1,
  limit: 12,
};

export const useIssueStore = create<IssueStoreState>((set, get) => ({
  list: null,
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  filters: defaultFilters,
  selectedIssue: null,

  setFilters: (patch) => {
    const next = { ...get().filters, ...patch };
    if (patch.q !== undefined || patch.status !== undefined || patch.priority !== undefined || patch.severity !== undefined) {
      next.page = 1;
    }
    set({ filters: next });
  },

  loadStats: async () => {
    set({ statsLoading: true });
    try {
      const stats = await issuesApi.getStats();
      set({ stats, statsLoading: false });
    } catch {
      set({ statsLoading: false });
    }
  },

  loadIssues: async () => {
    set({ loading: true, error: null });
    const f = get().filters;
    try {
      const list = await issuesApi.listIssues({
        page: f.page,
        limit: f.limit,
        q: f.q || undefined,
        status: f.status || undefined,
        priority: f.priority || undefined,
        severity: f.severity || undefined,
      });
      set({ list, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load issues";
      set({ loading: false, error: msg });
    }
  },

  loadBoardIssues: async () => {
    set({ loading: true, error: null });
    const f = get().filters;
    try {
      const list = await issuesApi.listIssues({
        page: 1,
        limit: 200,
        q: f.q || undefined,
        priority: f.priority || undefined,
        severity: f.severity || undefined,
      });
      set({ list, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load issues";
      set({ loading: false, error: msg });
    }
  },

  loadIssue: async (id) => {
    set({ selectedIssue: null });
    try {
      const issue = await issuesApi.getIssue(id);
      set({ selectedIssue: issue });
      return issue;
    } catch (e) {
      set({ selectedIssue: null });
      throw e;
    }
  },

  createIssue: async (input) => {
    const issue = await issuesApi.createIssue(input);
    await Promise.all([get().loadIssues(), get().loadStats()]);
    return issue;
  },

  updateIssue: async (id, patch) => {
    const issue = await issuesApi.updateIssue(id, patch);
    await Promise.all([get().loadIssues(), get().loadStats()]);
    set((s) => ({
      selectedIssue: s.selectedIssue?.id === id ? issue : s.selectedIssue,
    }));
    return issue;
  },

  deleteIssue: async (id) => {
    await issuesApi.deleteIssue(id);
    await Promise.all([get().loadIssues(), get().loadStats()]);
    set((s) => ({
      selectedIssue: s.selectedIssue?.id === id ? null : s.selectedIssue,
    }));
  },

  clearSelected: () => set({ selectedIssue: null }),
}));
