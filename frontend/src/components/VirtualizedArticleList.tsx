// VirtualizedArticleList.tsx
import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ArticleCard from "./ArticleCard";
import type { Article } from "../store/useFeedStore";

interface Props {
  articles: Article[];
  fetchNextPage?: () => void;
  renderItem?: (article: Article) => React.ReactNode;
  columnWidth?: number; // optional column width
  gap?: number; // spacing between items
}

const VirtualizedArticleList: React.FC<Props> = ({
  articles,
  fetchNextPage,
  renderItem,
  columnWidth = 350,
  gap = 16,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  // Calculate number of columns based on container width
  const calculateColumns = useCallback(() => {
    if (!parentRef.current) return;
    const width = parentRef.current.offsetWidth;
    const cols = Math.floor(width / (columnWidth + gap)) || 1;
    setColumns(cols);
  }, [columnWidth, gap]);

  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]);

  // Compute row count for virtualizer
  const rowCount = Math.ceil(articles.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 280, []),
    overscan: 5,
    getItemKey: useCallback(
      (index: number) => {
        const firstArticle = articles[index * columns];
        return firstArticle?._id ?? firstArticle?.url ?? index;
      },
      [articles, columns],
    ),
  });

  useEffect(() => {
    if (!fetchNextPage) return;
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastRow = virtualItems[virtualItems.length - 1];
    if (lastRow && lastRow.index >= rowCount - 2) {
      fetchNextPage();
    }
  }, [rowVirtualizer.getVirtualItems(), rowCount, fetchNextPage]);

  const defaultRender = (article: Article) => <ArticleCard article={article} />;
  const itemRenderer = renderItem || defaultRender;

  return (
    <div
      ref={parentRef}
      style={{
        height: "70vh",
        overflow: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowArticles = articles.slice(startIndex, startIndex + columns);
          if (!rowArticles.length) return null;

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                padding: "8px 0",
              }}
            >
              {rowArticles.map((article) => (
                <div key={article._id ?? article.url} style={{ width: "100%" }}>
                  {itemRenderer(article)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(VirtualizedArticleList);
