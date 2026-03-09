import { useEffect, useState } from "react";
import { fetchNewsNow } from "../../api";
import styles from "./AdminArticles.module.css";

interface Article {
  title: string;
  url: string;
  source: string;
  published_at: string;
  category?: string | null;
}

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // Load articles from backend
  const loadArticles = async () => {
    try {
      const res = await fetch("/api/admin/latest-articles", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch news and poll for new articles
  const handleFetchNews = async () => {
    setLoading(true);
    try {
      await fetchNewsNow();

      // Poll every 500ms for 5s max
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        await loadArticles();
        if (attempts >= 10) clearInterval(interval);
      }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Latest Articles</h4>
        <button
          className={styles.fetchBtn}
          onClick={handleFetchNews}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Fetching...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-down-circle me-2"></i>Fetch News Now
            </>
          )}
        </button>
      </div>

      {articles.length === 0 ? (
        <p className={styles.noArticles}>No articles found.</p>
      ) : (
        <div className={styles.articleList}>
          {articles.map((a, idx) => (
            <div key={idx} className={styles.articleItem}>
              <div className={styles.articleContent}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.articleTitle}
                >
                  {a.title}
                </a>
                <div className={styles.articleMeta}>
                  <span>
                    <i className="bi bi-globe me-1"></i>
                    {a.source}
                  </span>
                  <span>
                    <i className="bi bi-clock me-1"></i>
                    {new Date(a.published_at).toLocaleString()}
                  </span>
                  <span>
                    <i className="bi bi-tag me-1"></i>
                    {a.category ?? "Uncategorized"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
