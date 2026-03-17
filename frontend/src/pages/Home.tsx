import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useFeedStore } from "../store/useFeedStore";
import { useCategoryStore } from "../store/useCategoryStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";
import styles from "./Home.module.css";

const Home = () => {
  const { isAuth } = useStore();
  const { articles, fetchFeed, nextCursor, loading } = useFeedStore();
  const { subscriptions, subscribe } = useCategoryStore();

  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [discoverArticles, setDiscoverArticles] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);
  const { resetFeed } = useFeedStore();

  /*
  -----------------------------
  Personalized Feed
  -----------------------------
  */

  useEffect(() => {
    if (isAuth) {
      resetFeed(); // clear old articles
      fetchFeed();
    }
  }, [isAuth]);

  useEffect(() => {
    if (!loaderRef.current) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && nextCursor && !loading) {
          fetchFeed(nextCursor); // pass cursor object now
        }
      },
      { threshold: 0.5 },
    );

    observerRef.current.observe(loaderRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [nextCursor, loading, fetchFeed]);

  /*
  -----------------------------
  Discover Feed
  -----------------------------
  */

  const fetchDiscover = useCallback(async () => {
    setDiscoverLoading(true);

    try {
      const res = await API.get("/feed/discover");
      setDiscoverArticles(res.data.data || []);
    } catch (err) {
      console.error("Discover Error:", err);
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscover();
  }, [fetchDiscover]);

  /*
  Remove duplicate categories
  */

  const uniqueDiscover = useMemo(() => {
    const map = new Map();

    discoverArticles.forEach((a) => {
      if (!map.has(a.category_id)) {
        map.set(a.category_id, a);
      }
    });

    return Array.from(map.values());
  }, [discoverArticles]);

  /*
  -----------------------------
  Follow category
  -----------------------------
  */

  const handleFollow = async (categoryId: number) => {
    if (
      subscriptions.includes(categoryId) ||
      localFollowed.includes(categoryId)
    )
      return;

    try {
      setLocalFollowed((prev) => [...prev, categoryId]);

      await subscribe(categoryId);

      setDiscoverArticles((prev) =>
        prev.filter((a) => Number(a.category_id) !== categoryId),
      );
    } catch (err) {
      console.error(err);

      setLocalFollowed((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const uniqueArticles = useMemo(() => {
    const seen = new Set();
    return articles.filter((a) => {
      if (!a) return false;
      const identifier = a._id ?? a.url;
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
  }, [articles]);

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
              <div className={styles.titleUnderline}></div>
            </div>

            <div className={styles.grid}>
              {uniqueArticles.map((a) => (
                <ArticleCard key={`feed-${a._id ?? a.url}`} article={a} />
              ))}
            </div>

            <div ref={loaderRef} className={styles.loader}>
              {loading ? (
                <div className={styles.spinner}></div>
              ) : nextCursor ? (
                <span className={styles.scrollTip}>Loading more...</span>
              ) : (
                "✨ You're all caught up"
              )}
            </div>
          </section>

          {/* Discover */}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Discover Topics</h2>
              <div className={styles.titleUnderline}></div>
            </div>

            {discoverLoading ? (
              <div className={styles.loading}>
                Searching for fresh stories...
              </div>
            ) : (
              <div className={styles.grid}>
                {uniqueDiscover.map((a) => {
                  const cid = Number(a.category_id);

                  const isFollowed =
                    subscriptions.includes(cid) || localFollowed.includes(cid);

                  const categoryName =
                    a.category?.name || a.category || "Topic";

                  return (
                    <div
                      key={`discover-${a._id ?? a.url}`}
                      className={styles.discoverCard}
                    >
                      <ArticleCard article={a} />

                      <button
                        className={`${styles.followBtn} ${
                          isFollowed ? styles.followed : ""
                        }`}
                        onClick={() => handleFollow(cid)}
                        disabled={isFollowed}
                      >
                        {isFollowed ? (
                          <span>
                            <i className="bi bi-check2-circle me-2"></i>
                            Following
                          </span>
                        ) : (
                          `Explore ${categoryName}`
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default Home;
