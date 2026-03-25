import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import ProtectedRoute from "./components/ProtectedRoute";
import { refreshToken } from "./api"; // Import your refresh call

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgetPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard/AdminDashboard"),
);
const Profile = lazy(() => import("./pages/Profile/Profile"));
const CategoryList = lazy(
  () => import("./components/CategoryList/CategoryList"),
);
const SearchPage = lazy(() => import("./pages/SearchPage"));

const App = () => {
  const {
    theme,
    isAuth,
    role,
    initialized,
    setAuth,
    setInitialized,
    logout,
    startTokenRefreshLoop,
  } = useStore();
  const hasRun = useRef(false);

  // 1. Handle Theme and Auth Restoration
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    document.documentElement.setAttribute("data-bs-theme", theme);

    const restoreSession = async () => {
      if (isAuth) {
        startTokenRefreshLoop();
        setInitialized(true);
        return;
      }

      try {
        const res = await refreshToken();
        setAuth(res.data.token, res.data.role);
        startTokenRefreshLoop();
      } catch (err) {
        logout();
      } finally {
        setInitialized(true);
      }
    };

    restoreSession();
  }, []);

  // 2. Show a global loader until we know if the user is logged in
  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense
        fallback={
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Loading page...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Guest Routes: Redirect if already logged in */}
          <Route
            path="/login"
            element={
              !isAuth ? (
                <Login />
              ) : (
                <Navigate
                  to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  replace
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuth ? (
                <Register />
              ) : (
                <Navigate
                  to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  replace
                />
              )
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
