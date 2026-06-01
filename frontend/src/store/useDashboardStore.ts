// src/store/useDashboardStore.ts
import { create } from "zustand";
import API from "../api";

import type { DashboardState } from "../types";

export const useDashboardStore = create<DashboardState>((set) => ({
  categoryCount: 0,
  unreadNotifications: 0,
  recentArticles: [],
  // src/store/useDashboardStore.ts
  fetchStats: async () => {
    try {
      const { data } = await API.get("/dashboard");
      // Only set if data exists
      if (data) {
        set({
          categoryCount: data.categoryCount ?? 0,
          unreadNotifications: data.unreadNotifications ?? 0,
          recentArticles: data.recentArticles ?? [],
        });
      }
    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
    }
  },
}));
