import { create } from "zustand";
import {
  fetchCategories,
  fetchMySubscriptions,
  subscribeCategory,
  unsubscribeCategory,
} from "../api";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryStore {
  categories: Category[];
  subscriptions: number[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  subscribe: (id: number) => Promise<void>;
  unsubscribe: (id: number) => Promise<void>;

  addCategory: (category: Category) => void;
  updateCategory: (id: number, name: string, slug: string) => void;
  removeCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  subscriptions: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const res = await fetchCategories();
      set({ categories: res.data });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubscriptions: async () => {
    const res = await fetchMySubscriptions();
    set({ subscriptions: res.data.map((c: Category) => c.id) });
  },

  subscribe: async (id: number) => {
    await subscribeCategory(id);
    set({ subscriptions: [...get().subscriptions, id] });
  },

  unsubscribe: async (id: number) => {
    await unsubscribeCategory(id);
    set({ subscriptions: get().subscriptions.filter((s) => s !== id) });
  },

  // ----- Admin category helpers -----
  addCategory: (category: Category) => {
    set({ categories: [...get().categories, category] });
  },

  updateCategory: (id: number, name: string, slug: string) => {
    set({
      categories: get().categories.map((c) =>
        c.id === id ? { ...c, name, slug } : c,
      ),
    });
  },

  removeCategory: (id: number) => {
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
}));
