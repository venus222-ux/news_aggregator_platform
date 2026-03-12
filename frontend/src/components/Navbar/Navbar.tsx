import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSubscriptionStore } from "../../store/useSubscriptionStore";
import echo from "../../echo";
import styles from "./Navbar.module.css";
import { useState, useEffect, useRef } from "react";
import SearchDropdown from "../SearchDropdown";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const { count, addNotification, reset, fetchUnread, notifications } =
    useNotificationStore();
  const { subscriptions } = useSubscriptionStore();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const closeMenu = () => setExpanded(false);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setIsAuth(false);
    localStorage.removeItem("token");
    navigate("/login");
    setExpanded(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    setExpanded(false);
  };

  const handleNotificationClick = (url: string) => {
    navigate(url);
    setDropdownOpen(false);
    reset(); // mark all notifications as read
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications on mount
  useEffect(() => {
    if (isAuth) fetchUnread();
  }, [isAuth, fetchUnread]);

  // Subscribe to live notifications for user's categories
  useEffect(() => {
    if (!isAuth || subscriptions.length === 0) return;

    subscriptions.forEach((categoryId: number) => {
      echo
        .private(`category.${categoryId}`) // use PrivateChannel
        .listen(".article.created", (article: any) => {
          addNotification({
            id: article.id,
            title: article.title,
            url: `/feed`,
          });
        });
    });

    return () => {
      subscriptions.forEach((categoryId) =>
        echo.leave(`private-category.${categoryId}`),
      );
    };
  }, [subscriptions, isAuth, addNotification]);

  return (
    <nav className={`${styles.navbar} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.container}>
        {/* BRAND */}
        <Link className={styles.brand} to="/" onClick={closeMenu}>
          <i className="bi bi-newspaper me-2"></i>
          <span>NewsHub</span>
        </Link>

        {/* SEARCH */}
        {isAuth && (
          <div className={styles.searchWrapper}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <div className={styles.searchBar}>
                <i className={styles.searchIcon}>
                  <i className="bi bi-search"></i>
                </i>
                <input
                  type="text"
                  placeholder="Search news..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {query && (
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => setQuery("")}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
                <button type="submit" className={styles.searchSubmit}>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>
            <SearchDropdown query={query} onClose={() => setQuery("")} />
          </div>
        )}

        {/* MOBILE TOGGLER */}
        <button
          className={styles.toggler}
          onClick={() => setExpanded(!expanded)}
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>

        {/* NAV MENU */}
        <div className={`${styles.navCollapse} ${expanded ? styles.show : ""}`}>
          <div className={styles.navItems}>
            <Link
              className={`${styles.navBtn} ${isActive("/dashboard") ? styles.active : ""}`}
              to="/dashboard"
              onClick={closeMenu}
            >
              <i className="bi bi-house-door me-1"></i>Dashboard
            </Link>

            <Link
              className={`${styles.navBtn} ${isActive("/feed") ? styles.active : ""}`}
              to="/feed"
              onClick={closeMenu}
            >
              <i className="bi bi-newspaper me-1"></i>Feed
            </Link>

            {isAuth && (
              <Link
                className={`${styles.navBtn} ${isActive("/categories") ? styles.active : ""}`}
                to="/categories"
                onClick={closeMenu}
              >
                <i className="bi bi-tags me-1"></i>Categories
              </Link>
            )}

            {/* NOTIFICATION BELL */}
            {isAuth && (
              <div className={styles.notificationWrapper} ref={dropdownRef}>
                <div
                  className={styles.notificationBell}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <i className="bi bi-bell"></i>
                  {count > 0 && (
                    <span className={styles.notificationBadge}>{count}</span>
                  )}
                </div>

                {dropdownOpen && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                      <span>Notifications</span>
                      {count > 0 && (
                        <span className={styles.newBadge}>NEW</span>
                      )}
                    </div>
                    <div className={styles.notificationList}>
                      {notifications.length === 0 ? (
                        <div className={styles.notificationEmpty}>
                          <i className="bi bi-bell-slash"></i>
                          <p>All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.url}
                            className={styles.notificationItem}
                            onClick={() => handleNotificationClick(n.url)}
                          >
                            <div className={styles.notifTitle}>{n.title}</div>
                            <div className={styles.notifTime}>
                              New article published
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* THEME TOGGLE */}
            <button
              className={styles.themeBtn}
              onClick={() => {
                toggleTheme();
                closeMenu();
              }}
            >
              {theme === "light" ? (
                <i className="bi bi-moon-stars"></i>
              ) : (
                <i className="bi bi-sun"></i>
              )}
            </button>

            {/* LOGOUT */}
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
