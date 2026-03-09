import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useFeedStore } from "../store/useFeedStore";
import { useCategoryStore } from "../store/useCategoryStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";

const Home = () => {
  const { isAuth } = useStore();

  // Personalized Feed (subscribed categories)
  const { articles, fetchFeed, nextCursor, loading } = useFeedStore();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Discover / Follow section
  const [discoverArticles, setDiscoverArticles] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // Category store
  const { subscriptions, subscribe } = useCategoryStore();

  // Local state for instant follow feedback
  const [localFollowed, setLocalFollowed] = useState<number[]>([]);

  // --- Load personalized feed ---
  useEffect(() => {
    if (isAuth) fetchFeed();
  }, [isAuth]);

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

  // --- Load Discover / Follow section ---
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

  // Handle follow category with instant feedback
  const handleFollow = async (categoryId: number) => {
    if (
      subscriptions.includes(categoryId) ||
      localFollowed.includes(categoryId)
    )
      return;
    try {
      // Optimistically update local state
      setLocalFollowed([...localFollowed, categoryId]);
      await subscribe(categoryId);
    } catch (err) {
      console.error(err);
      // Rollback if error
      setLocalFollowed(localFollowed.filter((id) => id !== categoryId));
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3 text-center">🏡 Welcome to the Home Page</h1>

      {!isAuth ? (
        <>
          <p className="lead text-center">
            Please log in or register to access your personalized feed.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link className="btn btn-primary" to="/login">
              🔑 Login
            </Link>
            <Link className="btn btn-secondary" to="/register">
              📝 Register
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* Personalized Feed Section */}
          <h2 className="mb-4 text-center">📰 Your Personalized Feed</h2>
          {articles.length === 0 && !loading && (
            <p className="text-center">
              No articles found in your subscribed categories.
            </p>
          )}
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
          <div ref={loaderRef} className="text-center my-4">
            {loading
              ? "Loading..."
              : nextCursor
                ? "Scroll to load more"
                : articles.length
                  ? "No more articles"
                  : ""}
          </div>

          {/* Discover & Follow Section */}
          <h2 className="mb-4 mt-5 text-center">🌟 Discover & Follow</h2>
          {discoverLoading ? (
            <p className="text-center">Loading...</p>
          ) : discoverArticles.length === 0 ? (
            <p className="text-center">No articles to discover.</p>
          ) : (
            discoverArticles
              // Filter out categories the user already follows
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
                  <div key={a._id} className="mb-3">
                    <ArticleCard article={a} />
                    {categoryId && (
                      <button
                        className={`btn btn-sm mt-2 ${
                          isFollowed ? "btn-success" : "btn-outline-success"
                        }`}
                        onClick={() => handleFollow(categoryId)}
                        disabled={isFollowed}
                      >
                        <i className="bi bi-bell me-1"></i>
                        {isFollowed ? "Subscribed" : "Follow Category"}
                      </button>
                    )}
                  </div>
                );
              })
          )}

          <div className="text-center mt-4">
            <Link className="btn btn-success me-2" to="/dashboard">
              🚀 Go to Dashboard
            </Link>
            <Link className="btn btn-primary" to="/feed">
              📰 Go to Full Feed
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
