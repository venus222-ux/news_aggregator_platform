import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { useStore } from "./store/useStore";

// --- Types ---
export type Role = "user" | "moderator" | "admin" | null;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  token_type?: string;
  expires_in?: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ProfileData {
  name?: string;
  email: string;
  created_at?: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface APIMessageResponse {
  message: string;
}

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// --- Instance Setup ---
const API: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // 👈 Required for HttpOnly Cookies
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (data: { error?: unknown; token?: string }) => {
  failedQueue.forEach((prom) => {
    if (data.error) prom.reject(data.error);
    else if (data.token) prom.resolve(data.token!);
  });
  failedQueue = [];
};

// --- Interceptors ---

// Request: Attach Access Token from Zustand
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers || {};

  const token = useStore.getState().token;
  if (token && !config.url?.includes("/refresh")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Handle 401 and Refresh Loop
API.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetryableRequestConfig | undefined;

    if (!originalRequest) return Promise.reject(err);

    const isRefreshCall = originalRequest.url?.includes("/refresh");
    const isAuthRoute =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register");

    // If 401 Unauthorized and not an auth route/refresh call
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend reads HttpOnly refresh_token cookie automatically
        const response = await API.post<LoginResponse>("/refresh");
        const { token, role } = response.data;

        useStore.getState().setAuth(token, role);
        processQueue({ token });

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue({ error: refreshError });
        useStore.getState().logout();
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

// --- Exported API Methods ---

// Auth
export const login = (data: LoginRequest) =>
  API.post<LoginResponse>("/login", data);
export const register = (data: RegisterRequest) =>
  API.post<LoginResponse>("/register", data);
export const logoutRequest = () => API.post<APIMessageResponse>("/logout");
export const refreshToken = () => API.post<LoginResponse>("/refresh");

// Profile
export const getProfile = () => API.get<ProfileData>("/profile");
export const updateProfile = (data: ProfileUpdateRequest) =>
  API.put<APIMessageResponse>("/profile", data);
export const deleteProfile = () => API.delete<APIMessageResponse>("/profile");

// Categories & Subscriptions
export const fetchCategories = () => API.get("/categories");
export const fetchMySubscriptions = () => API.get("/subscriptions");
export const subscribeCategory = (id: number) =>
  API.post(`/categories/${id}/subscribe`);
export const unsubscribeCategory = (id: number) =>
  API.delete(`/categories/${id}/unsubscribe`);

// Admin
export const fetchSources = () => API.get("/admin/sources");
export const createSource = (data: any) => API.post("/admin/sources", data);
export const deleteSource = (id: number) => API.delete(`/admin/sources/${id}`);
export const fetchNewsNow = () => API.post("/admin/fetch-news");

// Articles
export const searchArticles = (q: string) => API.get(`/articles/search?q=${q}`);

export default API;
