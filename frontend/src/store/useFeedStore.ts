import { create } from "zustand";
import API from "../api";

interface Article {
  _id: string;
  title: string;
  description?: string;
  source: string;
  published_at: string;
  category_id?: string;
}

interface Cursor {
  date: string;
  id: string;
}

interface FeedStore {
  articles: Article[];
  nextCursor: Cursor | null; // store as object
  loading: boolean;
  fetchFeed: (cursor?: Cursor) => Promise<void>;
  resetFeed: () => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  articles: [],
  nextCursor: null,
  loading: false,

  fetchFeed: async (cursor?: Cursor) => {
    if (get().loading) return;

    set({ loading: true });

    try {
      const res = await API.get("/feed", {
        params: cursor
          ? { cursor_date: cursor.date, cursor_id: cursor.id }
          : {},
      });

      const newArticles = res.data.data || [];

      const merged = cursor ? [...get().articles, ...newArticles] : newArticles;

      set({
        articles: merged,
        nextCursor: res.data.nextCursor || null,
      });
    } finally {
      set({ loading: false });
    }
  },

  resetFeed: () => set({ articles: [], nextCursor: null }),
}));
