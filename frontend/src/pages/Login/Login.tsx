import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore } from "../../store/useStore"; // Check path based on your folder structure
import { login } from "../../api"; // Using the exported login function from your API file
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);
  const startTokenRefreshLoop = useStore(
    (state) => state.startTokenRefreshLoop,
  );

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the API (Returns access token in body, refresh token in HttpOnly cookie)
      const res = await login({ email, password });
      const { token, role } = res.data;

      // 2. Update Zustand store with the Access Token and Role
      setAuth(token, role);

      // 3. Start the background refresh interval
      startTokenRefreshLoop();

      toast.success("Welcome back! 👋");

      // 4. Role-based redirect
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error("Login Error:", err);

      let msg = "Login failed. Please try again.";

      if (err.response) {
        // Server responded with an error (401, 422, etc.)
        if (err.response.status === 401) {
          msg = "The credentials are incorrect.";
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        }
      } else if (err.request) {
        // No response from server (Network error)
        msg = "Network error. Please check if your API is running.";
      }

      toast.error(msg);
    } finally {
      setIsLoading(false);
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
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                autoFocus
                autoComplete="email"
                disabled={isLoading}
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
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-box-arrow-in-right me-2"></i>
              )}
              {isLoading ? "Logging in..." : "Login"}
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
