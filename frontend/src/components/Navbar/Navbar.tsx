import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/useStore";
import styles from "./Navbar.module.css";
import { useState } from "react";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    setIsAuth(false);
    navigate("/login");
    setExpanded(false);
  };

  const closeMenu = () => setExpanded(false);

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`${styles.navbar} ${theme === "dark" ? styles.dark : ""}`}>
      <div className={styles.container}>
        <Link className={styles.brand} to="/" onClick={closeMenu}>
          <i className="bi bi-chat-dots-fill me-2"></i>
          <span>Messenger</span>
        </Link>

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
              className={`${styles.navBtn} ${isActive("/dashboard") ? styles.active : ""}`}
              to="/dashboard"
              onClick={closeMenu}
            >
              <i className="bi bi-house-door me-1"></i>Dashboard
            </Link>
            <Link
              className={`${styles.navBtn} ${isActive("/profile") ? styles.active : ""}`}
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
                className={`${styles.navBtn} ${isActive("/categories") ? styles.active : ""}`}
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
