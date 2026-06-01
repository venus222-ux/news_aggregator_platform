// =========================
// APP STATE
// =========================

export interface AppState {
  isAuth: boolean;
  token: string | null;
  role: string | null;
  theme: "light" | "dark";
  initialized: boolean;

  setAuth: (token: string | null, role: string | null) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
  toggleTheme: () => void;
  setInitialized: (value: boolean) => void;

  startTokenRefreshLoop: () => void;
  stopTokenRefreshLoop: () => void;
}

// =========================
// UI TYPES
// =========================

export type TabType = "home" | "logs" | "users";

export interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

// =========================
// AUTH TYPES
// =========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  token_type?: string;
  expires_in?: number;
}

// =========================
// PROFILE TYPES
// =========================

export interface ProfileData {
  email: string;
  created_at?: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password: string;
  password_confirmation: string;
}

// =========================
// ARTICLES / FEED
// =========================

export interface Article {
  _id?: string;
  id?: string | number;
  title: string;
  description?: string;
  source: string;
  published_at: string;
  category_id?: string;
  url: string;
  unique_key?: string;
}

export interface AdminArticle {
  title: string;
  url: string;
  source: string;
  published_at: string;
  category?: string | null;
}

export interface RecentArticle {
  id: number;
  title: string;
  url: string;
  category: string;
  published_at: string;
  source?: string;
}

export interface Cursor {
  date: string;
  id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: Cursor | null;
}

export interface FeedPage {
  data: Article[];
  nextCursor?: Cursor | null;
}

export interface FeedQueryData {
  pages: FeedPage[];
  pageParams: unknown[];
}

export type HomeArticle = Article & {
  category?: string | { name: string };
  category_id?: string | number;
};

export interface FeedStore {
  articles: Article[];
  nextCursor: Cursor | null;
  loading: boolean;

  fetchFeed: (cursor?: Cursor) => Promise<void>;
  resetFeed: () => void;
}

// =========================
// NOTIFICATIONS
// =========================

export interface Notification {
  id: string;
  title: string;
  url: string;
  read?: boolean;
  source?: string;
  published_at?: string;
}

export interface NotificationState {
  count: number;
  notifications: Notification[];

  setCount: (count: number) => void;
  reset: () => Promise<void>;
  addNotification: (n: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  fetchUnread: () => Promise<void>;
}

// =========================
// DASHBOARD
// =========================

export interface DashboardState {
  categoryCount: number;
  unreadNotifications: number;
  recentArticles: RecentArticle[];

  fetchStats: () => Promise<void>;
}

export interface DashboardLogStats {
  logins_today: number;
  failed_logins_today: number;
  active_users: number;
}

export interface Activity {
  id: number | string;
  type: string;
  message: string;
  created_at: string;
  [key: string]: unknown;
}

export interface DashboardData {
  stats: DashboardLogStats;
  recent_activity: Activity[];
}

// =========================
// CATEGORY
// =========================

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryStore {
  categories: Category[];
  subscriptions: number[];
  loading: boolean;

  fetchAll: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  subscribe: (id: number) => Promise<void>;
  unsubscribe: (id: number) => Promise<void>;

  addCategory: (category: Category) => void;
  updateCategory: (id: number, name: string, slug: string) => void;
  removeCategory: (id: number) => void;
}

export interface CategoryStatsPoint {
  date: string;
  [categoryName: string]: number | string;
}

// =========================
// ANALYTICS
// =========================

export interface AnalyticsPoint {
  date: string;
  views: number;
  clicks: number;
}

export interface AnalyticsState {
  stats: AnalyticsPoint[];
  fetchStats: () => Promise<void>;
}

// =========================
// ADMIN USERS
// =========================

export interface AdminUser {
  id: number;
  name?: string;
  email: string;
  created_at: string;
  roles?: { name: string }[];
}
