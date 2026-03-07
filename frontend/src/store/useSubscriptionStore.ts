import { create } from "zustand";
import { refreshToken } from "../api";

interface AppState {
  subscriptions: number[];
  setSubscriptions: (subs: number[]) => void;
  subscribeCategory: (id: number) => void;
  unsubscribeCategory: (id: number) => void;
}

export const useSubscriptionStore = create<AppState>((set, get) => ({
  subscriptions: [],
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  subscribeCategory: (id) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, id],
    })),
  unsubscribeCategory: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s !== id),
    })),
}));
