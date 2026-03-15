// src/store/useSubscriptionStore.ts
import { create } from "zustand";
import API from "../api";

interface AppState {
  subscriptions: number[];
  setSubscriptions: (subs: number[]) => void;
  fetchSubscriptions: () => Promise<void>; // 🔥 Define the action
  subscribeCategory: (id: number) => void;
  unsubscribeCategory: (id: number) => void;
}

export const useSubscriptionStore = create<AppState>((set) => ({
  subscriptions: [],
  setSubscriptions: (subs) => set({ subscriptions: subs }),

  // 🔥 Fetch from your existing Laravel route
  fetchSubscriptions: async () => {
    try {
      const { data } = await API.get("/subscriptions");
      // If data is array of objects [{id: 1}, ...], map it. If just IDs [1, 2], use it directly.
      const ids = Array.isArray(data)
        ? data.map((s: any) => (typeof s === "object" ? s.id : s))
        : [];
      set({ subscriptions: ids });
    } catch (e) {
      console.error("Failed to load subscriptions", e);
    }
  },

  subscribeCategory: (id) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, id],
    })),
  unsubscribeCategory: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s !== id),
    })),
}));
