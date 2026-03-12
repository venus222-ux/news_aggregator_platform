// src/store/useDashboardStore.ts
import { create } from "zustand";
import API from "../api";

export interface RecentArticle {
  id: number;
  title: string;
  url: string;
  category: string;
  published_at: string;
}

interface DashboardState {
  categoryCount: number;
  unreadNotifications: number;
  recentArticles: RecentArticle[];
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  categoryCount: 0,
  unreadNotifications: 0,
  recentArticles: [],

  fetchStats: async () => {
    try {
      const { data } = await API.get("/dashboard");
      set({
        categoryCount: data.categoryCount,
        unreadNotifications: data.unreadNotifications,
        recentArticles: data.recentArticles,
      });
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
    }
  },
}));
