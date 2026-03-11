// FeedPage.tsx  (updated with modern CSS Modules styling)
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";
import styles from "./FeedPage.module.css";

const FeedPage = () => {
  const { subscriptions } = useCategoryStore();

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

  if (isLoading)
    return <div className={styles.loading}>Loading your feed...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;

  const articles = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className={styles.feedPage}>
      <div className={styles.headerWrapper}>
        <h2 className={styles.header}>📰 Your News Feed</h2>
        <p className={styles.subtitle}>
          Stay updated with your favorite categories
        </p>
      </div>

      {articles.length === 0 && (
        <div className={styles.emptyState}>
          <p>No articles in your subscribed categories yet.</p>
          <p className={styles.emptyHint}>
            Explore and follow categories on the home page!
          </p>
        </div>
      )}

      <div className={styles.articleGrid}>
        {articles.map((a) => (
          <ArticleCard key={a._id} article={a} />
        ))}
      </div>

      <div className={styles.loadMoreContainer}>
        {isFetchingNextPage ? (
          <div className={styles.loadingMore}>Loading more stories...</div>
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
            <p className={styles.endMessage}>🎉 You've reached the end</p>
          )
        )}
      </div>
    </div>
  );
};

export default FeedPage;
