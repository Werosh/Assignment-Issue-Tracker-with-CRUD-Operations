import { create } from "zustand";
import type { Issue, IssueListResponse, IssueStats } from "../types/issue";
import type { IssueFilters } from "../api/issues";
import * as issuesApi from "../api/issues";

const BOARD_FETCH_PAGE_SIZE = 100;

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
  loadingMore: boolean;
  statsLoading: boolean;
  error: string | null;
  filters: FilterState;
  /** Which issues UI is active so mutations refresh with the right query (list vs board). */
  issuesView: "list" | "board";
  setIssuesView: (view: "list" | "board") => void;
  selectedIssue: Issue | null;
  setFilters: (patch: Partial<FilterState>) => void;
  loadStats: () => Promise<void>;
  loadIssues: () => Promise<void>;
  loadMoreIssues: () => Promise<void>;
  /** Loads all issues for the Kanban board (paged requests until complete). */
  loadBoardIssues: () => Promise<void>;
  /** Refetch list data without toggling `loading` (avoids full-page flash after drag, edit, etc.). */
  refreshIssuesSilently: () => Promise<void>;
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
  limit: 20,
};

function listFilterParams(f: FilterState): IssueFilters {
  return {
    q: f.q || undefined,
    status: f.status || undefined,
    priority: f.priority || undefined,
    severity: f.severity || undefined,
  };
}

async function fetchAllIssuesForBoard(f: FilterState): Promise<IssueListResponse> {
  const base = listFilterParams(f);
  const all: Issue[] = [];
  let page = 1;
  let total = 0;
  let totalPages = 1;

  do {
    const res = await issuesApi.listIssues({
      ...base,
      page,
      limit: BOARD_FETCH_PAGE_SIZE,
    });
    all.push(...res.items);
    total = res.total;
    totalPages = res.totalPages;
    page += 1;
  } while (page <= totalPages);

  return {
    items: all,
    page: 1,
    limit: Math.max(all.length, 1),
    total,
    totalPages: 1,
  };
}

export const useIssueStore = create<IssueStoreState>((set, get) => ({
  list: null,
  stats: null,
  loading: false,
  loadingMore: false,
  statsLoading: false,
  error: null,
  filters: defaultFilters,
  issuesView: "list",
  selectedIssue: null,

  setIssuesView: (view) => set({ issuesView: view }),

  setFilters: (patch) => {
    const next = { ...get().filters, ...patch };
    if (
      patch.q !== undefined ||
      patch.status !== undefined ||
      patch.priority !== undefined ||
      patch.severity !== undefined
    ) {
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
        ...listFilterParams(f),
      });
      set({ list, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load issues";
      set({ loading: false, error: msg });
    }
  },

  loadMoreIssues: async () => {
    const state = get();
    const f = state.filters;
    const list = state.list;
    if (!list || state.loadingMore || state.loading) return;
    if (list.page >= list.totalPages) return;

    set({ loadingMore: true });
    try {
      const nextPage = list.page + 1;
      const next = await issuesApi.listIssues({
        page: nextPage,
        limit: f.limit,
        ...listFilterParams(f),
      });
      const seen = new Set(list.items.map((i) => i.id));
      const appended = next.items.filter((i) => !seen.has(i.id));
      set({
        list: {
          ...next,
          items: [...list.items, ...appended],
        },
        loadingMore: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load more issues";
      set({ loadingMore: false, error: msg });
    }
  },

  loadBoardIssues: async () => {
    set({ loading: true, error: null });
    const f = get().filters;
    try {
      const list = await fetchAllIssuesForBoard(f);
      set({ list, loading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load issues";
      set({ loading: false, error: msg });
    }
  },

  refreshIssuesSilently: async () => {
    const f = get().filters;
    const view = get().issuesView;
    const currentList = get().list;
    try {
      if (view === "board") {
        const list = await fetchAllIssuesForBoard(f);
        set({ list });
        return;
      }
      const targetLimit = Math.max(currentList?.items.length ?? 0, f.limit);
      const list = await issuesApi.listIssues({
        page: 1,
        limit: targetLimit,
        ...listFilterParams(f),
      });
      set({ list });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to refresh issues";
      set({ error: msg });
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
    await Promise.all([get().refreshIssuesSilently(), get().loadStats()]);
    return issue;
  },

  updateIssue: async (id, patch) => {
    const prevList = get().list;
    const prevIssue = prevList?.items.find((i) => i.id === id);
    const prevSelected = get().selectedIssue;

    if (prevList && prevIssue) {
      set({
        list: {
          ...prevList,
          items: prevList.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        },
      });
    }
    if (prevSelected?.id === id) {
      set({ selectedIssue: { ...prevSelected, ...patch } });
    }

    try {
      const issue = await issuesApi.updateIssue(id, patch);
      await get().loadStats();
      set((s) => {
        const list = s.list;
        const nextSelected = s.selectedIssue?.id === id ? issue : s.selectedIssue;
        if (!list) {
          return { selectedIssue: nextSelected };
        }
        const hasItem = list.items.some((i) => i.id === id);
        return {
          list: hasItem ? { ...list, items: list.items.map((i) => (i.id === id ? issue : i)) } : list,
          selectedIssue: nextSelected,
        };
      });
      return issue;
    } catch (e) {
      if (prevList && prevIssue) {
        set({
          list: {
            ...prevList,
            items: prevList.items.map((i) => (i.id === id ? prevIssue : i)),
          },
        });
      }
      if (prevSelected?.id === id) {
        set({ selectedIssue: prevSelected });
      }
      throw e;
    }
  },

  deleteIssue: async (id) => {
    await issuesApi.deleteIssue(id);
    await Promise.all([get().refreshIssuesSilently(), get().loadStats()]);
    set((s) => ({
      selectedIssue: s.selectedIssue?.id === id ? null : s.selectedIssue,
    }));
  },

  clearSelected: () => set({ selectedIssue: null }),
}));
