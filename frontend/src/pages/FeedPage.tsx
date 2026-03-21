// FeedPage.tsx
import { useEffect, useMemo, useCallback, lazy } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import API from "../api";
import styles from "./FeedPage.module.css";
const VirtualizedArticleList = lazy(
  () => import("../components/VirtualizedArticleList"),
);

import type { Article } from "../store/useFeedStore";

interface Cursor {
  date: string;
  id: string;
}

const FeedPage = () => {
  const { subscriptions } = useCategoryStore();
  const { notifications, setNotifications } = useNotificationStore();
  const queryClient = useQueryClient();

  // ── Stabilize subscriptions for queryKey (critical fix) ──
  const sortedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => a - b), // assuming numbers; use String(a) - String(b) if strings
    [subscriptions],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
  } = useInfiniteQuery({
    queryKey: ["feed", sortedSubscriptions],
    queryFn: ({ pageParam }: { pageParam?: Cursor }) =>
      API.get("/feed", {
        params: pageParam
          ? { cursor_date: pageParam.date, cursor_id: pageParam.id }
          : {},
      }).then((res) => res.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as Cursor | undefined,
    refetchOnWindowFocus: false, // ← prevents aggressive background refetches
    staleTime: 2 * 60 * 1000, // 2 minutes — tune based on how fresh data needs to be
    gcTime: 10 * 60 * 1000, // 10 minutes cache (formerly cacheTime)
  });

  const articles = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  const uniqueArticles = useMemo(() => {
    const seen = new Set<string>();
    const result: Article[] = [];

    for (const a of articles) {
      const id = String(a._id ?? a.url ?? a.id ?? "");

      if (!id || seen.has(id)) continue;

      seen.add(id);

      result.push({
        ...a,
        source: a.source ?? "Unknown source",
        url: a.url ?? "#",
      });
    }

    return result;
  }, [articles]);

  useEffect(() => {
    if (!notifications.length) return;
    const hasNew = notifications.some(
      (n) => !uniqueArticles.some((a) => String(a.id) === String(n.id)),
    );

    if (hasNew) {
      setNotifications([]); // clear immediately
      queryClient.invalidateQueries({
        queryKey: ["feed"],
        refetchType: "active",
        exact: false,
      });
    }
  }, [notifications, uniqueArticles, queryClient, setNotifications]);

  // Memoize the fetchNextPage callback so prop is stable
  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching]);

  // ── Early returns ──
  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p>Loading your personalized feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorCard}>
          <p>Failed to load feed. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedPage}>
      <header className={styles.headerSection}>
        <h2 className={styles.title}>📰 Your Feed</h2>
        <p className={styles.subtitle}>
          From {subscriptions.length} subscribed{" "}
          {subscriptions.length === 1 ? "category" : "categories"}
        </p>
      </header>

      <main className={styles.mainContent}>
        {uniqueArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No articles yet</h3>
            <p>Subscribe to more categories to see news here.</p>
          </div>
        ) : (
          <VirtualizedArticleList
            articles={uniqueArticles}
            fetchNextPage={hasNextPage ? handleFetchNext : undefined}
          />
        )}

        <footer className={styles.footer}>
          {isFetchingNextPage ? (
            <p>Loading more articles...</p>
          ) : hasNextPage ? (
            <button className={styles.loadMoreBtn} onClick={handleFetchNext}>
              Load More
            </button>
          ) : (
            uniqueArticles.length > 0 && <p>You've reached the end 🎉</p>
          )}
        </footer>
      </main>
    </div>
  );
};

export default FeedPage;
