import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile/Profile";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryList from "./components/CategoryList/CategoryList";
import FeedPage from "./pages/FeedPage";

const App = () => {
  const { theme, isAuth, startTokenRefreshLoop } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    if (isAuth) startTokenRefreshLoop(); // auto refresh if logged in
  }, [theme, isAuth, startTokenRefreshLoop]);

  return (
    <BrowserRouter>
      <Navbar />
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

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
