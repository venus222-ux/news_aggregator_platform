import { useEffect } from "react";
import { Link } from "react-router-dom"; // Add Link for navigation
import { useDashboardStore } from "../store/useDashboardStore";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { categoryCount, unreadNotifications, recentArticles, fetchStats } =
    useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className="text-muted">
          Here’s what’s happening with your feed today.
        </p>
      </header>

      <section className={styles.statsGrid}>
        {/* Card 1: Categories */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Subscribed</span>
            <div className={styles.iconWrapper}>
              <i className="bi bi-grid-1x2-fill"></i>
            </div>
          </div>
          <div className={styles.statValue}>{categoryCount}</div>
          <small className="text-muted">Active Categories</small>
        </div>

        {/* Card 2: Notifications */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Notifications</span>
            <div className={`${styles.iconWrapper} ${styles.iconWrapperAlt}`}>
              <i className="bi bi-bell-fill"></i>
            </div>
          </div>
          <div className={styles.statValue}>{unreadNotifications}</div>
          <small className="text-muted">Unread Messages</small>
        </div>
      </section>

      <section className={styles.recentSection}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-journal-text me-2 fs-4 text-primary"></i>
            <h3 className={`${styles.sectionTitle} mb-0`}>Recent Articles</h3>
          </div>
          <Link to="/feed" className={styles.viewAllBtn}>
            View Full Feed <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className={styles.articleList}>
          {recentArticles.length > 0 ? (
            recentArticles.map((a) => (
              <div key={`dash-${a.id ?? a.url}`} className={styles.articleItem}>
                <div className={styles.articleInfo}>
                  <span className={styles.sourceTag}>{a.source || "News"}</span>
                  <a
                    href={a.url}
                    className={styles.articleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.title}
                  </a>
                  <div className={styles.metaInfo}>
                    <span className={styles.dateText}>
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString()
                        : "Recent"}
                    </span>
                    <span className={styles.categoryBadge}>{a.category}</span>
                  </div>
                </div>
                <div className={styles.itemAction}>
                  <i className="bi bi-box-arrow-up-right"></i>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No recent articles found. Try following more categories!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
