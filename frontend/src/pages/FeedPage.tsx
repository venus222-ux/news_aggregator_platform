import { useInfiniteQuery } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";
import { useEffect } from "react";
import styles from "./FeedPage.module.css";

const FeedPage = () => {
  const { subscriptions } = useCategoryStore();
  const { notifications, setNotifications } = useNotificationStore();

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
      API.get(`/feed${pageParam ? `?cursor=${pageParam}` : ""}`).then(
        (res) => res.data,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined,
  });

  const articles = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (!notifications.length) return;

    // Safety check for live notifications
    const newArticles = notifications
      .filter((n) => n && !articles.some((a) => a?._id === n.id))
      .map((n) => ({
        _id: n.id,
        title: n.title,
        url: n.url,
        source: "Live",
        published_at: new Date().toISOString(),
      }));

    if (newArticles.length) {
      setNotifications([]);
    }
  }, [notifications, articles, setNotifications]);

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner}></div>
        <p>Curating your personal feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorCard}>
          <i className="bi bi-exclamation-triangle-fill mb-3"></i>
          <p>Failed to load feed: {(error as any).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedPage}>
      <header className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <span className={styles.emoji}>📰</span> Your Feed
          </h2>
          <p className={styles.subtitle}>
            Real-time updates from your {subscriptions.length} selected
            categories
          </p>
        </div>
      </header>

      <main className={styles.mainContent}>
        {articles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✨</div>
            <h3>Your feed is quiet...</h3>
            <p>
              Subscribe to more categories to see what's happening in the world.
            </p>
          </div>
        ) : (
          <div className={styles.articleGrid}>
            {articles.filter(Boolean).map((a) => (
              <ArticleCard key={a._id || a.id || Math.random()} article={a} />
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          {isFetchingNextPage ? (
            <div className={styles.loadingMore}>
              <div className={styles.miniSpinner}></div>
              <span>Fetching more stories...</span>
            </div>
          ) : hasNextPage ? (
            <button
              className={styles.loadMoreBtn}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              Load More Articles
            </button>
          ) : (
            articles.length > 0 && (
              <p className={styles.endMessage}>
                <i className="bi bi-check2-all me-2"></i>
                You've caught up with everything for now.
              </p>
            )
          )}
        </footer>
      </main>
    </div>
  );
};

export default FeedPage;
