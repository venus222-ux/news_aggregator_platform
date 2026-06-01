import { create } from "zustand";
import API from "../api";
import type { NotificationState } from "../types";

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  notifications: [],

  setCount: (count) => set({ count }),

  reset: async () => {
    try {
      await API.post("/notifications/mark-read");
      set({ count: 0, notifications: [] });
    } catch (e) {
      console.error("Failed to reset notifications", e);
    }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      count: state.count + 1,
    })),

  setNotifications: (notifications) =>
    set({ notifications, count: notifications.length }),

  fetchUnread: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await API.get("/notifications/unread");

      set({
        count: data.count,
        notifications: data.notifications || [],
      });
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  },
}));
