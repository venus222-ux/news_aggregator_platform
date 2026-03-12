import React from "react";
import styles from "./ArticleCard.module.css";

interface Article {
  _id?: string;
  title: string;
  description?: string;
  source: string;
  published_at: string;
  url: string;
  category?: string;
}

interface Props {
  article: Article;
}

const ArticleCard = ({ article }: Props) => {
  // CRASH PROTECTION: If article is missing, render nothing instead of crashing
  if (!article) return null;

  // SAFE DATE PARSING
  const dateObj = article.published_at
    ? new Date(article.published_at)
    : new Date();
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.source}>
          {article.source || "Unknown Source"}
        </span>
        <time className={styles.date}>{formattedDate}</time>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          {article.title || "No Title Available"}
        </h3>
        {article.description && (
          <p className={styles.description}>{article.description}</p>
        )}
      </div>

      <div className={styles.footer}>
        <a
          href={article.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Read Story
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;
