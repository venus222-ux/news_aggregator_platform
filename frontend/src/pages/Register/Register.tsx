import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
import styles from "./Register.module.css";

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const Register = () => {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/register", form);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.success("Registration successful! Please login.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <h3 className={styles.welcome}>Create Account</h3>
            <p className={styles.subtitle}>Join our community</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-person"></i>
                </span>
                <input
                  className={styles.input}
                  placeholder="Enter your full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Minimum 6 characters"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Re-enter your password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>
              {form.password !== form.password_confirmation &&
                form.password_confirmation && (
                  <div className={styles.error}>Passwords do not match</div>
                )}
            </div>

            <button className={styles.registerBtn} disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Register
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
