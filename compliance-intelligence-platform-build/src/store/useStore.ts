import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuditLogEntry, User } from '../types';

// User & Auth State
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set) => ({
        user: {
          id: 'USR-001',
          name: 'John Mitchell',
          email: 'john.mitchell@clearanceiq.com',
          role: 'Senior Analyst',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          department: 'Risk Management Services',
          lastLogin: new Date().toISOString(),
        },
        isAuthenticated: true,
        login: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
        updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
      }),
      { name: 'auth-store' }
    ),
    { name: 'clearanceiq-auth' }
  )
);

// Notifications State
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  module?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [
        {
          id: 'notif-1',
          type: 'error',
          title: 'Critical Independence Conflict',
          message: 'Tata Steel Ltd flagged for immediate review',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false,
          module: 'Independence Checker',
          actionUrl: '/independence',
        },
        {
          id: 'notif-2',
          type: 'warning',
          title: 'KPI Anomaly Detected',
          message: 'Compliance Score dropped below threshold',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          module: 'KPI Monitor',
          actionUrl: '/kpi',
        },
        {
          id: 'notif-3',
          type: 'success',
          title: 'Report Generated',
          message: 'Q4 Compliance Report ready for download',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: true,
          module: 'Report Generator',
          actionUrl: '/reports',
        },
      ],
      unreadCount: 2,
      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
          read: false,
        };
        return {
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
      }),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read 
            ? state.unreadCount - 1 
            : state.unreadCount,
        };
      }),
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'notification-store' }
  )
);

// Audit Log State
interface AuditLogState {
  logs: AuditLogEntry[];
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  getLogs: (filters?: { module?: string; user?: string; dateRange?: [Date, Date] }) => AuditLogEntry[];
}

export const useAuditLogStore = create<AuditLogState>()(
  persist(
    devtools(
      (set, get) => ({
        logs: [],
        addLog: (entry) => set((state) => {
          const newLog: AuditLogEntry = {
            ...entry,
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
          };
          return {
            logs: [newLog, ...state.logs].slice(0, 10000), // Keep last 10,000 entries
          };
        }),
        getLogs: (filters) => {
          const logs = get().logs;
          if (!filters) return logs;
          
          return logs.filter((log) => {
            if (filters.module && log.module !== filters.module) return false;
            if (filters.user && log.user !== filters.user) return false;
            if (filters.dateRange) {
              const logDate = new Date(log.timestamp);
              if (logDate < filters.dateRange[0] || logDate > filters.dateRange[1]) return false;
            }
            return true;
          });
        },
      }),
      { name: 'audit-log-store' }
    ),
    { name: 'clearanceiq-audit-logs' }
  )
);

// App Settings State
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showWelcomeMessage: boolean;
  dateFormat: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  sessionTimeout: number; // minutes
}

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  sidebarCollapsed: false,
  compactMode: false,
  showWelcomeMessage: true,
  dateFormat: 'MMM dd, yyyy',
  timezone: 'Asia/Kolkata',
  language: 'en',
  emailNotifications: true,
  pushNotifications: true,
  autoSave: true,
  sessionTimeout: 30,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    devtools(
      (set) => ({
        settings: defaultSettings,
        updateSettings: (updates) => set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
        resetSettings: () => set({ settings: defaultSettings }),
      }),
      { name: 'settings-store' }
    ),
    { name: 'clearanceiq-settings' }
  )
);

// Global Loading State
interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    (set) => ({
      isLoading: false,
      loadingMessage: '',
      setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
    }),
    { name: 'loading-store' }
  )
);

// Command Palette State
interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>()(
  devtools(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: 'command-palette-store' }
  )
);

// Recent Items State
interface RecentItem {
  id: string;
  type: 'entity' | 'case' | 'report' | 'dataset';
  name: string;
  module: string;
  timestamp: Date;
  url: string;
}

interface RecentItemsState {
  items: RecentItem[];
  addItem: (item: Omit<RecentItem, 'timestamp'>) => void;
  clearItems: () => void;
}

export const useRecentItemsStore = create<RecentItemsState>()(
  persist(
    devtools(
      (set) => ({
        items: [],
        addItem: (item) => set((state) => {
          const newItem = { ...item, timestamp: new Date() };
          const filteredItems = state.items.filter((i) => i.id !== item.id);
          return {
            items: [newItem, ...filteredItems].slice(0, 20), // Keep last 20
          };
        }),
        clearItems: () => set({ items: [] }),
      }),
      { name: 'recent-items-store' }
    ),
    { name: 'clearanceiq-recent-items' }
  )
);

// Toast State
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: `toast-${Date.now()}` }],
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
      isCommandPaletteOpen: false,
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
    }),
    { name: 'app-store' }
  )
);
