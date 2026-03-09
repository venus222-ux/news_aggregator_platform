import { useInfiniteQuery } from "@tanstack/react-query";
import { useCategoryStore } from "../store/useCategoryStore";
import ArticleCard from "../components/ArticleCard";
import API from "../api";

const FeedPage = () => {
  const { subscriptions } = useCategoryStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["feed", subscriptions], // Re-fetch on subscription change
    queryFn: ({ pageParam }) =>
      API.get(`/feed${pageParam ? `?cursor=${pageParam}` : ""}`).then(
        (res) => res.data,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined,
  });

  if (isLoading) return <div className="text-center mt-4">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-4 text-danger">Error: {error.message}</div>
    );

  const articles = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">📰 Your News Feed</h2>

      {articles.length === 0 && (
        <p className="text-center">
          No articles in your subscribed categories.
        </p>
      )}

      {articles.map((a) => (
        <ArticleCard key={a._id} article={a} />
      ))}

      <div className="text-center my-4">
        {isFetchingNextPage ? (
          "Loading more..."
        ) : hasNextPage ? (
          <button
            className="btn btn-secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load More
          </button>
        ) : (
          "No more articles"
        )}
      </div>
    </div>
  );
};

export default FeedPage;
