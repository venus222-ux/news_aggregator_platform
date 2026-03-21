import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages/components
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
  const { theme, isAuth, startTokenRefreshLoop } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    if (isAuth) startTokenRefreshLoop(); // auto refresh if logged in
  }, [theme, isAuth, startTokenRefreshLoop]);

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense
        fallback={
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading page...</p>
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
              ) : useStore.getState().role === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuth ? (
                <Register />
              ) : useStore.getState().role === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuth ? <Profile /> : <Navigate to="/login" />}
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
            path="/categories"
            element={isAuth ? <CategoryList /> : <Navigate to="/login" />}
          />

          {/* ✅ Feed route must be inside Routes */}
          <Route
            path="/feed"
            element={isAuth ? <FeedPage /> : <Navigate to="/login" />}
          />

          {/* ✅ Search */}
          <Route
            path="/search"
            element={isAuth ? <SearchPage /> : <Navigate to="/login" />}
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
