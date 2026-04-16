import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import API from "../../api";

import Sidebar from "../../components/AdminDashboard/Sidebar";
import styles from "../../styles/AdminDashboard.module.css";

type TabType = "home" | "logs" | "users";

/* =========================
   LAZY LOADED COMPONENTS
========================= */
const AdminCategories = lazy(
  () => import("../../components/AdminCategories/AdminCategories"),
);

const AdminSources = lazy(
  () => import("../../components/AdminSources/AdminSources"),
);

const AdminArticles = lazy(
  () => import("../../components/AdminArticles/AdminArticles"),
);

const ActivityTable = lazy(
  () => import("../../components/AdminDashboard/ActivityTable"),
);

const AdminAnalyticsByCategory = lazy(
  () => import("../../components/AdminAnalytics/AdminAnalytics"),
);

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ========================= */
  /* 🔥 FETCH LOGS */
  /* ========================= */
  useEffect(() => {
    if (currentTab === "logs") {
      API.get("/admin/dashboard")
        .then((res) => setData(res.data))
        .catch((err) =>
          setError(err.response?.data?.message || "Request failed"),
        );
    }
  }, [currentTab]);

  /* ========================= */
  /* 🔥 FETCH USERS */
  /* ========================= */
  useEffect(() => {
    if (currentTab === "users") {
      API.get("/admin/users")
        .then((res) => setUsers(res.data))
        .catch((err) =>
          setError(err.response?.data?.message || "Failed to load users"),
        );
    }
  }, [currentTab]);

  /* ========================= */
  /* 🗑 DELETE USER */
  /* ========================= */
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (error) return <div className={styles.errorState}>⚠️ {error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* SIDEBAR */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* MAIN */}
      <main className={styles.mainContent}>
        {/* ========================= */}
        {/* 🏠 HOME */}
        {/* ========================= */}
        {currentTab === "home" && (
          <div className={styles.dashboard}>
            <header className={styles.header}>
              <h2 className={styles.title}>Overview</h2>
              <span>{new Date().toLocaleDateString()}</span>
            </header>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-people"></i>
                </div>
                <div className={styles.cardInfo}>
                  <p className={styles.cardTitle}>Users</p>
                  <h3 className={styles.cardValue}>{users.length}</h3>
                  <Link to="#" onClick={() => setCurrentTab("users")}>
                    Manage
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
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-activity"></i>
                </div>
                <div className={styles.cardInfo}>
                  <p className={styles.cardTitle}>System Growth</p>
                  <h3 className={styles.cardValue}>+12.5%</h3>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                <div className={styles.sectionCard}>
                  <div className={styles.cardHeader}>
                    <h4>Engagement Analytics</h4>
                  </div>
                  <div className={styles.cardBody}>
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <AdminAnalyticsByCategory />
                    </Suspense>
                  </div>
                </div>

                <div className={styles.sectionCard}>
                  <div className={styles.cardHeader}>
                    <h4>Latest Articles</h4>
                  </div>
                  <div className={styles.cardBody}>
                    <Suspense fallback={<div>Loading articles...</div>}>
                      <AdminArticles />
                    </Suspense>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className={styles.sectionCard}>
                  <div className={styles.cardHeader}>
                    <h4>Sources</h4>
                  </div>
                  <div className={styles.cardBody}>
                    <Suspense fallback={<div>Loading sources...</div>}>
                      <AdminSources />
                    </Suspense>
                  </div>
                </div>

                <div className={styles.sectionCard}>
                  <div className={styles.cardHeader}>
                    <h4>Categories</h4>
                  </div>
                  <div className={styles.cardBody}>
                    <Suspense fallback={<div>Loading categories...</div>}>
                      <AdminCategories />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* 📜 LOGS */}
        {/* ========================= */}
        {currentTab === "logs" && (
          <>
            <header className={styles.header}>
              <h2>Activity Logs</h2>
            </header>

            {!data ? (
              <div className={styles.loadingState}>Loading logs...</div>
            ) : (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span>Logins Today</span>
                    <h3>{data.stats.logins_today}</h3>
                  </div>

                  <div className={styles.statCard}>
                    <span>Failed</span>
                    <h3>{data.stats.failed_logins_today}</h3>
                  </div>

                  <div className={styles.statCard}>
                    <span>Active Users</span>
                    <h3>{data.stats.active_users}</h3>
                  </div>
                </div>

                <Suspense fallback={<div>Loading table...</div>}>
                  <ActivityTable activities={data.recent_activity} />
                </Suspense>
              </>
            )}
          </>
        )}

        {/* ========================= */}
        {/* 👥 USERS */}
        {/* ========================= */}
        {currentTab === "users" && (
          <>
            <header className={styles.header}>
              <h2>User Management</h2>
            </header>

            <div className={styles.tableWrapper}>
              <div className={styles.tableHeader}>
                Total Users: {users.length}
              </div>

              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "N/A"}</td>
                      <td>{user.email}</td>
                      <td>{user.roles?.[0]?.name || "user"}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
