// src/components/Navbar/Navbar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSubscriptionStore } from "../../store/useSubscriptionStore";
import { useState, useEffect, useRef } from "react";
import SearchDropdown from "../SearchDropdown";
import styles from "./Navbar.module.css";

// 1. Import the Real-time Hook
import useCategoryNotifications from "../../hooks/useCategoryNotifications";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const { count, reset, fetchUnread, notifications } = useNotificationStore();

  // 2. Access the subscription store to load categories
  const { fetchSubscriptions } = useSubscriptionStore();

  // 3. Initialize the Real-time Engine
  useCategoryNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const closeMenu = () => setExpanded(false);
  const isActive = (path: string) => location.pathname === path;

  // 4. Fetch necessary data when the user logs in or refreshes
  useEffect(() => {
    if (!isAuth) return;

    fetchUnread();
    fetchSubscriptions();
  }, [isAuth]);

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
    reset();
  };

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

  return (
    <nav className={`${styles.navbar} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.container}>
        <div className="d-flex align-items-center">
          <Link className={styles.brand} to="/" onClick={closeMenu}>
            <i className="bi bi-newspaper"></i>
            <span>NewsHub</span>
          </Link>

          {isAuth && (
            <div className={styles.searchWrapper}>
              <form className={styles.searchBar} onSubmit={handleSearch}>
                <i className="bi bi-search text-muted"></i>
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </form>
              <SearchDropdown query={query} onClose={() => setQuery("")} />
            </div>
          )}
        </div>

        <button
          className="btn d-lg-none border-0"
          onClick={() => setExpanded(!expanded)}
        >
          <i
            className={`bi bi-${expanded ? "x-lg" : "list"} fs-3 text-primary`}
          ></i>
        </button>

        <div className={`${styles.navCollapse} ${expanded ? styles.show : ""}`}>
          <div className={styles.navItems}>
            <Link
              className={`${styles.navBtn} ${isActive("/dashboard") ? styles.active : ""}`}
              to="/dashboard"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
            <Link
              className={`${styles.navBtn} ${isActive("/feed") ? styles.active : ""}`}
              to="/feed"
              onClick={closeMenu}
            >
              Feed
            </Link>
            {isAuth && (
              <Link
                className={`${styles.navBtn} ${isActive("/categories") ? styles.active : ""}`}
                to="/categories"
                onClick={closeMenu}
              >
                Categories
              </Link>
            )}

            <div className="d-flex align-items-center ms-lg-3 gap-2">
              {isAuth && (
                <div className={styles.notificationWrapper} ref={dropdownRef}>
                  <div
                    className={styles.notificationBell}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <i className="bi bi-bell-fill"></i>
                    {count > 0 && (
                      <span className={styles.notificationBadge}></span>
                    )}
                  </div>

                  {dropdownOpen && (
                    <div className={styles.notificationDropdown}>
                      <div className={styles.notificationHeader}>
                        Notifications
                      </div>
                      <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted small">
                            No new alerts
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              key={n.id}
                              to={n.url}
                              className={styles.notificationItem}
                              onClick={() => handleNotificationClick(n.url)}
                            >
                              <strong>{n.title}</strong>
                              <div className="text-muted smaller">
                                Tap to view article
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className={styles.themeBtn} onClick={toggleTheme}>
                <i
                  className={`bi bi-${theme === "light" ? "moon-stars-fill" : "sun-fill"}`}
                ></i>
              </button>

              {isAuth && (
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
