import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);

  // pages/Login.tsx (updated)
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
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 420 }}>
        <h3 className="text-center mb-3">🔑 Login</h3>

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100 mb-3">Login</button>
        </form>

        <div className="d-flex justify-content-between small">
          <Link to="/register">📝 Register</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
