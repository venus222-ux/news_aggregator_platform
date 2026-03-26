import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import ProtectedRoute from "./components/ProtectedRoute";
import { refreshToken } from "./api";
import ErrorBoundary from "./components/ErrorBoundary";

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

  // Apply theme immediately to avoid white flash
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const restoreSession = async () => {
      try {
        const res = await refreshToken();
        setAuth(res.data.token, res.data.role);
        startTokenRefreshLoop();
      } catch {
        logout();
      } finally {
        // Always set initialized to true, even on error
        setInitialized(true);
      }
    };

    restoreSession();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Navbar />

        <main>
          {!initialized ? (
            <div className="d-flex justify-content-center mt-5 pt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Initializing...</span>
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="d-flex justify-content-center mt-5 pt-5">
                  <div className="spinner-border text-primary" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />

                <Route
                  path="/login"
                  element={
                    !isAuth ? (
                      <Login />
                    ) : (
                      <Navigate
                        to={
                          role === "admin" ? "/admin/dashboard" : "/dashboard"
                        }
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
                        to={
                          role === "admin" ? "/admin/dashboard" : "/dashboard"
                        }
                        replace
                      />
                    )
                  }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
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

                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          )}
        </main>

        <ToastContainer position="bottom-right" theme={theme} />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
