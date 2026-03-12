import { useEffect, useRef, useState } from "react";
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
  const loaderRef = useRef<HTMLDivElement>(null);

  const [discoverArticles, setDiscoverArticles] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const { subscriptions, subscribe } = useCategoryStore();
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);

  useEffect(() => {
    if (isAuth) fetchFeed();
  }, [isAuth, fetchFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loading) {
          fetchFeed(nextCursor);
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [nextCursor, loading, fetchFeed]);

  useEffect(() => {
    const fetchDiscover = async () => {
      setDiscoverLoading(true);
      try {
        const res = await API.get("/feed/discover");
        setDiscoverArticles(res.data.data || []);
      } catch (err) {
        console.error("Discover Error:", err);
      } finally {
        setDiscoverLoading(false);
      }
    };
    fetchDiscover();
  }, []);

  const handleFollow = async (categoryId: number) => {
    if (
      subscriptions.includes(categoryId) ||
      localFollowed.includes(categoryId)
    )
      return;
    try {
      setLocalFollowed((prev) => [...prev, categoryId]);
      await subscribe(categoryId);
    } catch (err) {
      console.error(err);
      setLocalFollowed((prev) => prev.filter((id) => id !== categoryId));
    }
  };

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
          {/* PERSONALIZED FEED */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>For You</h2>
              <div className={styles.titleUnderline}></div>
            </div>

            <div className={styles.grid}>
              {articles &&
                articles
                  .filter(Boolean)
                  .map((a) => (
                    <ArticleCard
                      key={a._id || a.id || Math.random()}
                      article={a}
                    />
                  ))}
            </div>

            <div ref={loaderRef} className={styles.loader}>
              {loading ? (
                <div className={styles.spinner}></div>
              ) : nextCursor ? (
                <span className={styles.scrollTip}>Checking for more...</span>
              ) : (
                "✨ You're all caught up"
              )}
            </div>
          </section>

          {/* DISCOVER & FOLLOW */}
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
                {discoverArticles &&
                  discoverArticles
                    .filter((a) => {
                      if (!a) return false;
                      const cid = Number(a.category_id || 0);
                      return (
                        cid &&
                        !subscriptions.includes(cid) &&
                        !localFollowed.includes(cid)
                      );
                    })
                    .map((a) => {
                      const cid = Number(a.category_id);
                      const isFollowed =
                        subscriptions.includes(cid) ||
                        localFollowed.includes(cid);
                      return (
                        <div
                          key={a._id || Math.random()}
                          className={styles.discoverCard}
                        >
                          <ArticleCard article={a} />
                          <button
                            className={`${styles.followBtn} ${isFollowed ? styles.followed : ""}`}
                            onClick={() => handleFollow(cid)}
                            disabled={isFollowed}
                          >
                            {isFollowed
                              ? "Subscribed"
                              : `Follow ${a.category || "Topic"}`}
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
