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

interface FeedStore {
  articles: Article[];
  nextCursor: string | null;
  loading: boolean;
  fetchFeed: (cursor?: string) => Promise<void>;
  resetFeed: () => void; // ✅ add this
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  articles: [],
  nextCursor: null,
  loading: false,

  fetchFeed: async (cursor) => {
    set({ loading: true });
    try {
      const res = await API.get(`/feed${cursor ? `?cursor=${cursor}` : ""}`);
      set({
        articles: cursor
          ? [...get().articles, ...res.data.data]
          : res.data.data,
        nextCursor: res.data.nextCursor,
      });
    } finally {
      set({ loading: false });
    }
  },

  resetFeed: () => set({ articles: [], nextCursor: null }), // ✅ implementation
}));
