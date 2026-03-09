import React from "react";

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
  const truncatedDesc = article.description
    ? `${article.description.slice(0, 150)}...`
    : "";

  return (
    <div
      className="card mb-3 shadow-sm"
      aria-labelledby={`article-title-${article.url}`}
    >
      <div className="card-body">
        <h5 className="card-title" id={`article-title-${article.url}`}>
          {article.title}
        </h5>
        {truncatedDesc && <p className="card-text">{truncatedDesc}</p>}
        <p className="card-text">
          <small className="text-muted">
            Source: {article.source} |{" "}
            {new Date(article.published_at).toLocaleString()}
          </small>
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          aria-label={`Read more about ${article.title}`}
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;
