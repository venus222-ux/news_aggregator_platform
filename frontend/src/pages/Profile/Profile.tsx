import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import { useStore } from "../../store/useStore";
import styles from "./Profile.module.css";

interface ProfileData {
  email: string;
  created_at?: string;
}

interface FormData {
  email: string;
  password: string;
  password_confirmation: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setIsAuth = useStore((state) => state.setIsAuth);

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        setProfile(res.data);
        setFormData((prev) => ({ ...prev, email: res.data.email || "" }));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    API.put("/profile", formData)
      .then((res) => toast.success(res.data.message))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Update failed"),
      );
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account.",
      )
    )
      return;

    API.delete("/profile")
      .then(() => {
        toast.success("Account deleted");
        setIsAuth(false);
        localStorage.removeItem("token");
        window.location.replace("/login");
      })
      .catch(() => toast.error("Failed to delete account"));
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.title}>
            <i className="bi bi-person-circle me-2"></i>Profile
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{profile?.email || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Joined</span>
              <span className={styles.value}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>

          <hr className={styles.divider} />

          <h5 className={styles.subtitle}>
            <i className="bi bi-pencil-square me-2"></i>Edit Information
          </h5>
          <form onSubmit={handleUpdate} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>New Password</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className={styles.input}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Confirm Password</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className={styles.input}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button type="submit" className={styles.updateBtn}>
              <i className="bi bi-check-circle me-2"></i>Update Profile
            </button>
          </form>

          <hr className={styles.divider} />

          <div className={styles.deleteSection}>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <i className="bi bi-trash3 me-2"></i>Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
