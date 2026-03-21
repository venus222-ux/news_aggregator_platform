import { useEffect, useState, useMemo, useCallback, lazy } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
const ArticleCard = lazy(() => import("../components/ArticleCard"));
const VirtualizedArticleList = lazy(
  () => import("../components/VirtualizedArticleList"),
);

import API from "../api";
import styles from "./Home.module.css";
import type { Article, Cursor, HomeArticle } from "../store/useFeedStore";

const Home = () => {
  const { isAuth } = useStore();
  const { subscriptions, subscribe } = useCategoryStore();
  const { notifications, setNotifications } = useNotificationStore();
  const queryClient = useQueryClient();

  const sortedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => a - b),
    [subscriptions],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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
    enabled: isAuth,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
    initialPageParam: undefined as Cursor | undefined,
  });

  const articles = useMemo(
    () => (data?.pages.flatMap((p) => p.data) || []) as Article[],
    [data],
  );

  const uniqueArticles = useMemo(() => {
    const seen = new Set<string>();

    return articles.filter((a) => {
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

  useEffect(() => {
    if (!hasNewNotifications) return;

    setNotifications([]);
    queryClient.invalidateQueries({
      queryKey: ["feed"],
      exact: false,
      refetchType: "active",
    });
  }, [hasNewNotifications, queryClient, setNotifications]);

  const [discoverArticles, setDiscoverArticles] = useState<HomeArticle[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);

  const fetchDiscover = useCallback(async () => {
    setDiscoverLoading(true);
    try {
      const res = await API.get("/feed/discover");
      setDiscoverArticles((res.data.data || []) as HomeArticle[]);
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

  const uniqueDiscover = useMemo(() => {
    const map = new Map<number, HomeArticle>();

    discoverArticles.forEach((a) => {
      const catId = Number(a.category_id);
      if (!map.has(catId)) map.set(catId, a);
    });

    return Array.from(map.values());
  }, [discoverArticles]);

  const discoverList = useMemo<Article[]>(
    () =>
      uniqueDiscover.map((a) => ({
        _id: a._id,
        id: a.id,
        title:
          typeof a.category === "object" && a.category !== null
            ? a.category.name
            : typeof a.category === "string"
              ? a.category
              : "Topic",
        description: a.description,
        source: "Category",
        published_at: a.published_at || new Date().toISOString(),
        category_id:
          a.category_id !== undefined ? String(a.category_id) : undefined,
        url: `category-${String(a.category_id ?? "")}`,
      })),
    [uniqueDiscover],
  );

  return (
    <div className={styles.homePage}>
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
                fetchNextPage={hasNextPage ? () => fetchNextPage() : undefined}
              />
            )}

            {isFetchingNextPage && (
              <p className={styles.loadingMore}>Loading more articles...</p>
            )}
          </section>

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
