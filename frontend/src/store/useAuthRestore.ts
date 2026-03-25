import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import { refreshToken } from "../api";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export const useAuthRestore = () => {
  const location = useLocation();
  const { setAuth, setInitialized } = useStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const isPublic = publicRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/"),
    );

    if (isPublic) {
      setInitialized(true);
      return;
    }

    const restore = async () => {
      try {
        const res = await refreshToken();
        setAuth(res.data.token, res.data.role);
      } catch {
        // ❗ nu logout aici
      } finally {
        setInitialized(true);
      }
    };

    restore();
  }, [location.pathname, setAuth, setInitialized]);
};
