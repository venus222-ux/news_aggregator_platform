import { create } from "zustand";
import API from "../api";

interface AnalyticsState {
  stats: { date: string; views: number; clicks: number }[];
  fetchStats: () => Promise<void>;
}

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
