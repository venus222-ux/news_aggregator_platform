// Home.tsx  (updated with modern CSS Modules styling + consistent grid)
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

  // Personalized Feed
  const { articles, fetchFeed, nextCursor, loading } = useFeedStore();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Discover
  const [discoverArticles, setDiscoverArticles] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  const { subscriptions, subscribe } = useCategoryStore();
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);

  // Load personalized feed
  useEffect(() => {
    if (isAuth) fetchFeed();
  }, [isAuth]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loading) {
          fetchFeed(nextCursor);
        }
      },
      { threshold: 1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [nextCursor, loading]);

  // Discover feed
  const fetchDiscover = async () => {
    setDiscoverLoading(true);
    try {
      const res = await API.get("/feed/discover");
      setDiscoverArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscoverLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscover();
  }, []);

  const handleFollow = async (categoryId: number) => {
    if (
      subscriptions.includes(categoryId) ||
      localFollowed.includes(categoryId)
    )
      return;

    try {
      setLocalFollowed([...localFollowed, categoryId]);
      await subscribe(categoryId);
    } catch (err) {
      console.error(err);
      setLocalFollowed(localFollowed.filter((id) => id !== categoryId));
    }
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>🏡 Welcome back!</h1>
        <p className={styles.heroSubtitle}>Your personal news universe</p>
      </div>

      {!isAuth ? (
        <div className={styles.authPrompt}>
          <p className={styles.lead}>
            Please log in or register to unlock your personalized feed and
            discover amazing content.
          </p>
          <div className={styles.authButtons}>
            <Link className={styles.btnPrimary} to="/login">
              🔑 Login
            </Link>
            <Link className={styles.btnSecondary} to="/register">
              📝 Register
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Personalized Feed */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📰 Your Personalized Feed</h2>
              <p className={styles.sectionDesc}>
                Based on categories you follow
              </p>
            </div>

            {articles.length === 0 && !loading && (
              <div className={styles.emptyState}>
                No articles yet. Start following categories below!
              </div>
            )}

            <div className={styles.articleGrid}>
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>

            <div ref={loaderRef} className={styles.infiniteLoader}>
              {loading
                ? "Loading more stories..."
                : nextCursor
                  ? "Scroll for more"
                  : "You've reached the end ✨"}
            </div>
          </section>

          {/* Discover & Follow */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🌟 Discover & Follow</h2>
              <p className={styles.sectionDesc}>
                Find new categories from trending stories
              </p>
            </div>

            {discoverLoading ? (
              <div className={styles.loading}>
                Finding fresh stories for you...
              </div>
            ) : discoverArticles.length === 0 ? (
              <div className={styles.emptyState}>
                No new stories to discover right now.
              </div>
            ) : (
              <div className={styles.articleGrid}>
                {discoverArticles
                  .filter((a) => {
                    const categoryId = Number(a.category_id || 0);
                    return (
                      categoryId &&
                      !subscriptions.includes(categoryId) &&
                      !localFollowed.includes(categoryId)
                    );
                  })
                  .map((a) => {
                    const categoryId = Number(a.category_id || 0);
                    const isFollowed =
                      subscriptions.includes(categoryId) ||
                      localFollowed.includes(categoryId);

                    return (
                      <div key={a._id} className={styles.discoverCard}>
                        <ArticleCard article={a} />
                        {categoryId && (
                          <button
                            className={`${styles.followBtn} ${isFollowed ? styles.followed : ""}`}
                            onClick={() => handleFollow(categoryId)}
                            disabled={isFollowed}
                          >
                            <i className="bi bi-bell me-2"></i>
                            {isFollowed ? "✓ Subscribed" : "Follow Category"}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          <div className={styles.footerLinks}>
            <Link className={styles.bigBtn} to="/dashboard">
              🚀 Go to Dashboard
            </Link>
            <Link className={styles.bigBtn} to="/feed">
              📰 View Full Feed
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
