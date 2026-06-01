import { create } from "zustand";
import API from "../api";

import type { AnalyticsState } from "../types";

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  stats: [],
  fetchStats: async () => {
    try {
      const { data } = await API.get("/admin/analytics/article-stats");
      set({ stats: data });
    } catch (e) {
      console.error("Failed to fetch analytics stats", e);
    }
  },
}));
