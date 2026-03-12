import { useEffect } from "react";
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

      <section>
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-journal-text me-2 fs-4 text-primary"></i>
          <h3 className={`${styles.sectionTitle} mb-0`}>Recent Articles</h3>
        </div>

        <ul className={styles.articleList}>
          {recentArticles.length > 0 ? (
            recentArticles.map((a) => (
              <li key={a.id} className={styles.articleItem}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-post me-3 text-muted"></i>
                  <a
                    href={a.url}
                    className={styles.articleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {a.title}
                  </a>
                </div>
                <span className={styles.categoryBadge}>{a.category}</span>
              </li>
            ))
          ) : (
            <li className="text-center p-5 text-muted">
              No recent articles found.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
