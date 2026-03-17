// src/store/useNotificationStore.ts
import { create } from "zustand";
import API from "../api";

export interface Notification {
  id: string;
  title: string;
  url: string;
  read?: boolean;
}

interface NotificationState {
  count: number;
  notifications: Notification[];
  setCount: (count: number) => void;
  reset: () => Promise<void>;
  addNotification: (n: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  fetchUnread: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  count: 0,
  notifications: [],

  setCount: (count) => set({ count }),

  // Reset all notifications (mark as read)
  reset: async () => {
    try {
      await API.post("/notifications/mark-read");
      set({ count: 0, notifications: [] });
    } catch (e) {
      console.error("Failed to reset notifications", e);
    }
  },

  // Add a new notification
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      count: state.count + 1,
    })),

  setNotifications: (notifications: Notification[]) =>
    set({ notifications, count: notifications.length }),

  fetchUnread: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // 👈 prevent unnecessary call

      const { data } = await API.get("/notifications/unread");

      set({
        count: data.count,
        notifications: data.notifications || [],
      });
    } catch (e: any) {
      if (e.name === "CanceledError") return;
      console.error("Failed to fetch unread notifications", e);
    }
  },
}));
