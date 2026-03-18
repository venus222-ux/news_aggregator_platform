// Home.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import ArticleCard from "../components/ArticleCard";
import VirtualizedArticleList from "../components/VirtualizedArticleList";
import API from "../api";
import styles from "./Home.module.css";

interface Article {
  _id?: string;
  url: string;
  title: string;
  description?: string;
  source: string;
  published_at: string;
  category_id?: number | string;
  category?: { name: string } | string;
}

const Home = () => {
  const { isAuth } = useStore();
  const { subscriptions, subscribe } = useCategoryStore();
  const { notifications, setNotifications } = useNotificationStore();
  const queryClient = useQueryClient();

  // ── Stabilize subscriptions for query key ──
  const sortedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => a - b),
    [subscriptions],
  );

  /* ----------------------
     Personalized Feed
  ---------------------- */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["feed", sortedSubscriptions],
    queryFn: ({ pageParam }) =>
      API.get("/feed", {
        params: pageParam
          ? { cursor_date: pageParam.date, cursor_id: pageParam.id }
          : {},
      }).then((res) => res.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuth,
    refetchOnWindowFocus: false, // ← prevent aggressive refetch on focus
    staleTime: 3 * 60 * 1000, // 3 minutes – adjust as needed
    initialPageParam: undefined,
  });

  const articles = useMemo(
    () => data?.pages.flatMap((p) => p.data) || [],
    [data],
  );

  const uniqueArticles = useMemo(() => {
    const seen = new Set<string>();
    return articles.filter((a: Article) => {
      const id = a._id ?? a.url;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [articles]);

  const hasNewNotifications = useMemo(
    () =>
      notifications.some((n) => !uniqueArticles.some((a) => a._id === n.id)),
    [notifications, uniqueArticles],
  );

  // ── Handle new notifications without creating render loop ──
  useEffect(() => {
    if (!hasNewNotifications) return;

    // Invalidate only active queries + prevent loop by clearing notifications first
    setNotifications([]);
    queryClient.invalidateQueries({
      queryKey: ["feed"],
      exact: false,
      refetchType: "active",
    });
  }, [hasNewNotifications, queryClient, setNotifications]);

  /* ----------------------
     Discover Feed
  ---------------------- */
  const [discoverArticles, setDiscoverArticles] = useState<Article[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);

  const fetchDiscover = useCallback(async () => {
    setDiscoverLoading(true);
    try {
      const res = await API.get("/feed/discover");
      setDiscoverArticles(res.data.data || []);
    } catch (err) {
      console.error("Discover fetch failed:", err);
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuth) fetchDiscover();
  }, [isAuth, fetchDiscover]);

  const handleFollow = useCallback(
    async (categoryId: number) => {
      if (
        subscriptions.includes(categoryId) ||
        localFollowed.includes(categoryId)
      ) {
        return;
      }

      try {
        setLocalFollowed((prev) => [...prev, categoryId]);
        await subscribe(categoryId);

        // Remove followed category from discover
        setDiscoverArticles((prev) =>
          prev.filter((a) => Number(a.category_id) !== categoryId),
        );
      } catch (err) {
        console.error("Follow failed:", err);
        setLocalFollowed((prev) => prev.filter((id) => id !== categoryId));
      }
    },
    [subscriptions, localFollowed, subscribe],
  );

  // ── Deduplicate discover by category + stabilize shape ──
  const uniqueDiscover = useMemo(() => {
    const map = new Map<number, Article>();
    discoverArticles.forEach((a) => {
      const catId = Number(a.category_id);
      if (!map.has(catId)) map.set(catId, a);
    });
    return Array.from(map.values());
  }, [discoverArticles]);

  const discoverList = useMemo(
    () =>
      uniqueDiscover.map((a) => ({
        ...a,
        title:
          a.category?.name ||
          (typeof a.category === "string" ? a.category : "Topic"),
        source: "Category",
        published_at: a.published_at || new Date().toISOString(),
        url: `category-${a.category_id}`,
      })),
    [uniqueDiscover],
  );

  /* ----------------------
     Render
  ---------------------- */
  return (
    <div className={styles.homePage}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Stay Ahead of <span className={styles.accent}>Everything.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your personalized intelligence feed. Curated by you, powered by
            NewsHub.
          </p>
          {!isAuth && (
            <div className={styles.heroActions}>
              <Link to="/login" className={styles.btnPrimary}>
                Start Reading
              </Link>
              <Link to="/register" className={styles.btnSecondary}>
                Join NewsHub
              </Link>
            </div>
          )}
        </div>
      </section>

      {isAuth && (
        <main className={styles.mainContent}>
          {/* Personalized Feed */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>For You</h2>
              <div className={styles.titleUnderline} />
            </div>

            {isLoading ? (
              <div className={styles.centered}>
                <div className={styles.spinner} />
                <p>Loading your personalized feed...</p>
              </div>
            ) : error ? (
              <div className={styles.centered}>
                <div className={styles.errorCard}>
                  <p>Failed to load feed. Please try again later.</p>
                </div>
              </div>
            ) : uniqueArticles.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Your feed is empty</h3>
                <p>Follow more topics to see articles here.</p>
              </div>
            ) : (
              <VirtualizedArticleList
                articles={uniqueArticles}
                fetchNextPage={hasNextPage ? fetchNextPage : undefined}
              />
            )}

            {isFetchingNextPage && (
              <p className={styles.loadingMore}>Loading more articles...</p>
            )}
          </section>

          {/* Discover Topics */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Discover Topics</h2>
              <div className={styles.titleUnderline} />
            </div>

            {discoverLoading ? (
              <div className={styles.loading}>
                Searching for fresh stories...
              </div>
            ) : discoverList.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No discoverable topics right now</h3>
                <p>Check back later for new topics to explore.</p>
              </div>
            ) : (
              <VirtualizedArticleList
                articles={discoverList}
                fetchNextPage={undefined}
                renderItem={(article) => (
                  <div className={styles.discoverCard}>
                    <ArticleCard article={article} />
                    <button
                      className={`${styles.followBtn} ${
                        subscriptions.includes(Number(article.category_id)) ||
                        localFollowed.includes(Number(article.category_id))
                          ? styles.followed
                          : ""
                      }`}
                      onClick={() => handleFollow(Number(article.category_id))}
                      disabled={
                        subscriptions.includes(Number(article.category_id)) ||
                        localFollowed.includes(Number(article.category_id))
                      }
                    >
                      {subscriptions.includes(Number(article.category_id)) ||
                      localFollowed.includes(Number(article.category_id))
                        ? "Following"
                        : `Explore ${article.title}`}
                    </button>
                  </div>
                )}
              />
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default Home;
