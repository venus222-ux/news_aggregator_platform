import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSubscriptionStore } from "../../store/useSubscriptionStore";
import { useState, useEffect, useRef } from "react";
import SearchDropdown from "../SearchDropdown";
import styles from "./Navbar.module.css";
import useCategoryNotifications from "../../hooks/useCategoryNotifications";

export default function Navbar() {
  // Destructure with fallbacks to prevent undefined errors
  const {
    isAuth = false,
    initialized = false,
    theme = "light",
    toggleTheme,
    logout,
  } = useStore();

  const { count, reset, fetchUnread, notifications } = useNotificationStore();
  const { fetchSubscriptions } = useSubscriptionStore();

  // Safe hook call – the hook itself now checks for echo and subscriptions array
  useCategoryNotifications();

  // Only fetch notifications/subscriptions when authenticated and initialized
  useEffect(() => {
    if (!initialized || !isAuth) return;

    const fetchData = async () => {
      try {
        await fetchUnread();
      } catch (err: any) {
        // Ignore aborted requests (common during fast navigation)
        if (err?.message !== "Request aborted") {
          console.error("fetchUnread failed", err);
        }
      }

      try {
        await fetchSubscriptions();
      } catch (err: any) {
        if (err?.message !== "Request aborted") {
          console.error("fetchSubscriptions failed", err);
        }
      }
    };

    fetchData();
  }, [initialized, isAuth, fetchUnread, fetchSubscriptions]);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const closeMenu = () => setExpanded(false);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
    closeMenu();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    closeMenu();
  };

  const handleNotificationClick = (url: string) => {
    navigate(url);
    setDropdownOpen(false);
    reset();
  };

  // Close notification dropdown when clicking outside
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
        {/* LEFT SIDE */}
        <div className="d-flex align-items-center">
          <Link className={styles.brand} to="/" onClick={closeMenu}>
            <i className="bi bi-newspaper"></i>
            <span>NewsHub</span>
          </Link>

          {/* 🔍 Search (only if logged in) */}
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

        {/* MOBILE BUTTON */}
        <button
          className="btn d-lg-none border-0"
          onClick={() => setExpanded(!expanded)}
        >
          <i
            className={`bi bi-${expanded ? "x-lg" : "list"} fs-3 text-primary`}
          ></i>
        </button>

        {/* MENU */}
        <div className={`${styles.navCollapse} ${expanded ? styles.show : ""}`}>
          <div className={styles.navItems}>
            {/* 🔐 AUTH MENU */}
            {isAuth && (
              <>
                <Link
                  className={`${styles.navBtn} ${
                    isActive("/dashboard") ? styles.active : ""
                  }`}
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

                <Link
                  className={`${styles.navBtn} ${
                    isActive("/feed") ? styles.active : ""
                  }`}
                  to="/feed"
                  onClick={closeMenu}
                >
                  Feed
                </Link>

                <Link
                  className={`${styles.navBtn} ${
                    isActive("/profile") ? styles.active : ""
                  }`}
                  to="/profile"
                  onClick={closeMenu}
                >
                  Profile
                </Link>

                <Link
                  className={`${styles.navBtn} ${
                    isActive("/categories") ? styles.active : ""
                  }`}
                  to="/categories"
                  onClick={closeMenu}
                >
                  Categories
                </Link>
              </>
            )}

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center ms-lg-3 gap-2">
              {/* 🔔 Notifications */}
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

              {/* 🌙 Theme toggle */}
              <button className={styles.themeBtn} onClick={toggleTheme}>
                <i
                  className={`bi bi-${
                    theme === "light" ? "moon-stars-fill" : "sun-fill"
                  }`}
                ></i>
              </button>

              {/* 🔑 Auth buttons */}
              {!isAuth ? (
                <>
                  <Link
                    to="/login"
                    className={styles.navBtn}
                    onClick={closeMenu}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className={styles.navBtn}
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </>
              ) : (
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
