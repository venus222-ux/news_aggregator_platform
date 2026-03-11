import React from "react";
import styles from "./ArticleCard.module.css";

interface Article {
  title: string;
  description?: string;
  content?: string;
  source: string;
  published_at: string;
  url: string;
}

interface Props {
  article: Article;
}

const ArticleCard = ({ article }: Props) => {
  // Format date elegantly
  const formattedDate = new Date(article.published_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <article
      className={styles.card}
      aria-labelledby={`article-title-${article.url}`}
    >
      {/* Optional decorative top gradient bar */}
      <div className={styles.gradientBar} aria-hidden="true" />

      <div className={styles.content}>
        {/* Title */}
        <h3 id={`article-title-${article.url}`} className={styles.title}>
          {article.title}
        </h3>

        {/* Description (no manual truncation, use CSS line-clamp) */}
        {article.description && (
          <p className={styles.description}>{article.description}</p>
        )}

        {/* Metadata */}
        <div className={styles.metadata}>
          <span className={styles.source}>
            <svg
              className={styles.icon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
            </svg>
            {article.source}
          </span>
          <time dateTime={article.published_at} className={styles.date}>
            {formattedDate}
          </time>
        </div>

        {/* Action Button */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
          aria-label={`Read full article: ${article.title}`}
        >
          Read article
          <svg
            className={styles.buttonIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;
