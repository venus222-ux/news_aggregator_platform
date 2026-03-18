// FeedPage.tsx
import { useEffect, useMemo, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import API from "../api";
import styles from "./FeedPage.module.css";
import VirtualizedArticleList from "../components/VirtualizedArticleList";
import { RecentArticle } from "../store/useDashboardStore";

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
    const result: RecentArticle[] = [];

    for (const a of articles) {
      const id = a._id ?? a.url;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push(a);
      }
    }

    return result;
  }, [articles]);

  // Then your useEffect and render logic...
  // ── Notification handling: avoid depending on unstable articles ──
  // Better: compare against uniqueArticles (already memoized)
  // Also clear notifications first to prevent loop if invalidate triggers re-render
  useEffect(() => {
    if (!notifications.length) return;

    const hasNew = notifications.some(
      (n) => !uniqueArticles.some((a) => a._id === n.id),
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
