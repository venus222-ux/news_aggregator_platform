import { useEffect, useState } from "react";
import { searchArticles } from "../api";

const SearchDropdown = ({
  query,
  onClose,
}: {
  query: string;
  onClose?: () => void;
}) => {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await searchArticles(query);
      setResults(res.data.slice(0, 6));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!results.length) return null;

  const handleClick = () => {
    setResults([]);
    onClose?.();
  };

  return (
    <div className="search-dropdown">
      {results.map((r) => (
        <a
          key={r.url}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick} // closes dropdown after click
          className="search-item"
          aria-label={`${r.title} (opens in new tab)`}
        >
          <i className="bi bi-newspaper"></i>
          <span>{r.title}</span>
          <span className="srOnly">(opens in new tab)</span>
        </a>
      ))}
    </div>
  );
};

export default SearchDropdown;
