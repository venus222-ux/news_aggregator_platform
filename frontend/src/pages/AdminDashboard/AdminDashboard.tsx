import { Link } from "react-router-dom";
import AdminCategories from "../../components/AdminCategories/AdminCategories";
import styles from "./AdminDashboard.module.css";
import AdminSources from "../../components/AdminSources/AdminSources";
import AdminArticles from "../../components/AdminArticles/AdminArticles";

const AdminDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>
        <i className="bi bi-shield-lock me-2"></i>Admin Dashboard
      </h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-people-fill"></i>
          </div>
          <h5 className={styles.cardTitle}>Users</h5>
          <p className={styles.cardText}>Manage platform users</p>
          <Link to="/admin/users" className={styles.cardBtn}>
            Manage <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-newspaper"></i>
          </div>
          <h5 className={styles.cardTitle}>Articles</h5>
          <p className={styles.cardText}>Moderate news articles</p>
          <Link to="/admin/articles" className={styles.cardBtn}>
            Moderate <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-graph-up"></i>
          </div>
          <h5 className={styles.cardTitle}>Analytics</h5>
          <p className={styles.cardText}>View system statistics</p>
          <Link to="/admin/analytics" className={styles.cardBtn}>
            View <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardHeaderTitle}>
            <i className="bi bi-tags me-2"></i>Category Management
          </h4>
        </div>
        <div className={styles.cardBody}>
          <AdminCategories />
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardHeaderTitle}>
            <i className="bi bi-rss me-2"></i>News Sources
          </h4>
        </div>
        <div className={styles.cardBody}>
          <AdminSources />
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardHeaderTitle}>
            <i className="bi bi-newspaper me-2"></i>Latest Articles
          </h4>
        </div>
        <div className={styles.cardBody}>
          <AdminArticles />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
