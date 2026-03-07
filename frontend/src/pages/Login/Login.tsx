import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";
import { useStore } from "../../store/useStore";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", { email, password });
      const { token, role } = res.data;

      // Save auth + role in Zustand + localStorage
      setAuth(token, role);

      toast.success("Welcome back!");

      // Role-based redirect
      if (role === "admin") {
        navigate("/admin/dashboard"); // redirect admins
      } else {
        navigate("/dashboard"); // regular users
      }
    } catch {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <i className="bi bi-chat-dots-fill"></i>
            </div>
            <h3 className={styles.welcome}>Welcome Back</h3>
            <p className={styles.subtitle}>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className={styles.input}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className={styles.loginBtn}>
              <i className="bi bi-box-arrow-in-right me-2"></i>Login
            </button>
          </form>

          <div className={styles.footer}>
            <Link to="/register" className={styles.link}>
              Create account
            </Link>
            <Link to="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
