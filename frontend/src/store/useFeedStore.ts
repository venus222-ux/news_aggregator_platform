import { create } from "zustand";
import API from "../api";

import type { FeedStore, Article, Cursor } from "../types";

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

      const newArticles: Article[] = (res.data.data || []) as Article[];
      const currentArticles: Article[] = get().articles;

      const merged: Article[] = cursor
        ? [...currentArticles, ...newArticles]
        : newArticles;

      const uniqueMerged: Article[] = merged.filter(
        (article: Article, index: number, self: Article[]) =>
          index ===
          self.findIndex(
            (a: Article) =>
              (a._id && a._id === article._id) ||
              (a.url && a.url === article.url),
          ),
      );

      set({
        articles: uniqueMerged,
        nextCursor: (res.data.nextCursor as Cursor) || null,
      });
    } finally {
      set({ loading: false });
    }
  },

  resetFeed: () => set({ articles: [], nextCursor: null }),
}));
