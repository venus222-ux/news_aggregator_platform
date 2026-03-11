import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";
import styles from "./Navbar.module.css";
import { useState } from "react";
import SearchDropdown from "../SearchDropdown";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    setIsAuth(false);
    navigate("/login");
    setExpanded(false);
  };
  const closeMenu = () => setExpanded(false);
  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    setExpanded(false);
  };

  return (
    <nav className={`${styles.navbar} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.container}>
        <Link className={styles.brand} to="/" onClick={closeMenu}>
          <i className="bi bi-chat-dots-fill me-2"></i>
          <span>Messenger</span>
        </Link>

        {/* ==================== MODERN SEARCH BAR ==================== */}
        {isAuth && (
          <div className={styles.searchWrapper}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <div className={styles.searchBar}>
                <i className={styles.searchIcon}>
                  <i className="bi bi-search"></i>
                </i>

                <input
                  type="text"
                  placeholder="Search articles & news..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />

                {query && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setQuery("")}
                    aria-label="Clear"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}

                <button
                  type="submit"
                  className={styles.searchSubmit}
                  aria-label="Search"
                >
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>

            <SearchDropdown query={query} onClose={() => setQuery("")} />
          </div>
        )}
        <button
          className={styles.toggler}
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-controls="navbarNav"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

        <div className={`${styles.navCollapse} ${expanded ? styles.show : ""}`}>
          <div className={styles.navItems}>
            <Link
              className={`${styles.navBtn} ${
                isActive("/dashboard") ? styles.active : ""
              }`}
              to="/dashboard"
              onClick={closeMenu}
            >
              <i className="bi bi-house-door me-1"></i>Dashboard
            </Link>

            <Link
              className={`${styles.navBtn} ${
                isActive("/profile") ? styles.active : ""
              }`}
              to="/profile"
              onClick={closeMenu}
            >
              <i className="bi bi-person-circle me-1"></i>Profile
            </Link>

            <Link
              className={`${styles.navBtn} ${
                location.pathname === "/feed" ? styles.active : ""
              }`}
              to="/feed"
              onClick={closeMenu}
            >
              <i className="bi bi-newspaper me-1"></i>Feed
            </Link>

            {isAuth && (
              <Link
                className={`${styles.navBtn} ${
                  isActive("/categories") ? styles.active : ""
                }`}
                to="/categories"
                onClick={closeMenu}
              >
                <i className="bi bi-tags me-1"></i>Categories
              </Link>
            )}

            <button
              className={styles.themeBtn}
              onClick={() => {
                toggleTheme();
                closeMenu();
              }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <i className="bi bi-moon-stars"></i>
              ) : (
                <i className="bi bi-sun"></i>
              )}
            </button>

            {isAuth && (
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
