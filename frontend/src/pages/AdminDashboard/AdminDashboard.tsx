import { Link } from "react-router-dom";
import AdminCategories from "../../components/AdminCategories/AdminCategories";
import styles from "./AdminDashboard.module.css";
import AdminSources from "../../components/AdminSources/AdminSources";
import AdminArticles from "../../components/AdminArticles/AdminArticles";
import AdminAnalyticsByCategory from "../../components/AdminAnalytics/AdminAnalytics"; // sau AdminAnalytics

const AdminDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <i className="bi bi-grid-1x2-fill me-3 text-primary"></i>
          Overview
        </h2>
        <div className={styles.headerActions}>
          {/* Add a date or search bar here for a more professional feel */}
          <span className="text-muted small">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </header>

      {/* Top Row: Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-people"></i>
          </div>
          <div className={styles.cardInfo}>
            <p className={styles.cardTitle}>Users</p>
            <h3 className={styles.cardValue}>1,284</h3>
            <Link to="/admin/users" className={styles.cardBtn}>
              Manage <i className="bi bi-chevron-right ms-1"></i>
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <div className={styles.cardInfo}>
            <p className={styles.cardTitle}>Articles</p>
            <h3 className={styles.cardValue}>452</h3>
            <Link to="/admin/articles" className={styles.cardBtn}>
              Moderate <i className="bi bi-chevron-right ms-1"></i>
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-activity"></i>
          </div>
          <div className={styles.cardInfo}>
            <p className={styles.cardTitle}>System Growth</p>
            <h3 className={styles.cardValue}>+12.5%</h3>
            <Link to="/admin/analytics" className={styles.cardBtn}>
              View <i className="bi bi-chevron-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardHeaderTitle}>Engagement Analytics</h4>
            </div>
            <div className={styles.cardBody}>
              <AdminAnalyticsByCategory />
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardHeaderTitle}>Latest Articles</h4>
            </div>
            <div className={styles.cardBody}>
              <AdminArticles />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardHeaderTitle}>Sources</h4>
            </div>
            <div className={styles.cardBody}>
              <AdminSources />
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardHeaderTitle}>Categories</h4>
            </div>
            <div className={styles.cardBody}>
              <AdminCategories />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
