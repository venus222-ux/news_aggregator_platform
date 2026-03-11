import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchArticles } from "../api";
import styles from "./SearchPage.module.css";
import { useStore } from "../store/useStore";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useStore();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchArticles(q).then((res) => {
      setResults(res.data);
      setLoading(false);
    });
  }, [q]);

  if (loading)
    return <div className={styles.loading}>Searching the universe...</div>;
  if (!results.length)
    return (
      <div className={styles.noResults}>
        <i className="bi bi-search display-1 text-muted"></i>
        <h2>No results for "{q}"</h2>
        <p>Try different keywords</p>
      </div>
    );

  return (
    <div
      className={`${styles.searchPage} ${theme === "dark" ? styles.dark : ""}`}
    >
      <div className={styles.header}>
        <h1>
          Results for <span>"{q}"</span>
        </h1>
        <p>
          {results.length} article{results.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className={styles.resultsGrid}>
        {results.map((article) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.resultCard}
            aria-label={`Read full article: ${article.title} (opens in new tab)`}
          >
            <div className={styles.cardImage}>
              <i className="bi bi-newspaper"></i>
            </div>
            <div className={styles.cardContent}>
              <h3>{article.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
