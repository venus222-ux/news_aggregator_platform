import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";
import { useEffect } from "react";
import styles from "./FeedPage.module.css";

interface Cursor {
  date: string;
  id: string;
}

const FeedPage = () => {
  const { subscriptions } = useCategoryStore();
  const { notifications, setNotifications } = useNotificationStore();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["feed", subscriptions],
    queryFn: ({ pageParam }) =>
      API.get("/feed", {
        params: pageParam
          ? {
              cursor_date: pageParam.date,
              cursor_id: pageParam.id,
            }
          : {},
      }).then((res) => res.data),

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    initialPageParam: undefined,

    refetchOnWindowFocus: true,
  });

  const articles = data?.pages.flatMap((page) => page.data) || [];

  // 🔔 Real-time notification handling
  useEffect(() => {
    if (!notifications.length) return;

    const hasNew = notifications.some(
      (n) => !articles.some((a) => a._id === n.id),
    );

    if (hasNew) {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setNotifications([]);
    }
  }, [notifications, articles, queryClient, setNotifications]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner}></div>
        <p>Loading your personalized feed...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorCard}>
          <p>Failed to load feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedPage}>
      <header className={styles.headerSection}>
        <h2 className={styles.title}>📰 Your Feed</h2>
        <p className={styles.subtitle}>
          From {subscriptions.length} subscribed categories
        </p>
      </header>

      <main className={styles.mainContent}>
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No articles yet</h3>
            <p>Subscribe to categories to start seeing news.</p>
          </div>
        ) : (
          <div className={styles.articleGrid}>
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          {isFetchingNextPage ? (
            <p>Loading more...</p>
          ) : hasNextPage ? (
            <button
              className={styles.loadMoreBtn}
              onClick={() => fetchNextPage()}
            >
              Load More
            </button>
          ) : (
            articles.length > 0 && <p>You've reached the end 🎉</p>
          )}
        </footer>
      </main>
    </div>
  );
};

export default FeedPage;
