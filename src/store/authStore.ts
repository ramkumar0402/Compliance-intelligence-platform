import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegistrationData,
  UserPreferences,
  SecurityLog,
  ROLE_PERMISSIONS 
} from '../types/auth';

interface AuthStore {
  // State
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  securityLogs: SecurityLog[];
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegistrationData) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  numberFormat: 'en-US',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    inApp: true,
    digest: 'daily',
    alerts: {
      critical: true,
      high: true,
      medium: true,
      low: false,
    },
    modules: {
      dataQuality: true,
      independence: true,
      kpiMonitor: true,
      reconciliation: true,
      reports: true,
    },
  },
  dashboard: {
    defaultView: 'home',
    refreshInterval: 30000,
    showWelcomeMessage: true,
    pinnedModules: [],
    recentItemsCount: 10,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    screenReader: false,
  },
};

// Simulated user database
const userDatabase: Map<string, { user: User; password: string }> = new Map();

// Initialize with demo users
const initializeDemoUsers = () => {
  const demoUsers = [
    {
      email: 'admin@clearanceiq.com',
      password: 'admin123',
      user: {
        id: 'usr_001',
        email: 'admin@clearanceiq.com',
        firstName: 'Sarah',
        lastName: 'Anderson',
        role: 'admin' as const,
        department: 'Risk Management Services',
        title: 'Partner',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        timezone: 'America/New_York',
        bio: 'Leading the Risk Management Services practice with over 15 years of experience in compliance and audit.',
        dateJoined: '2020-01-15',
        lastLogin: new Date().toISOString(),
        isActive: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        preferences: defaultPreferences,
        permissions: ROLE_PERMISSIONS.admin,
      },
    },
    {
      email: 'analyst@clearanceiq.com',
      password: 'analyst123',
      user: {
        id: 'usr_002',
        email: 'analyst@clearanceiq.com',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'analyst' as const,
        department: 'Audit & Assurance',
        title: 'Senior Associate',
        phone: '+1 (555) 234-5678',
        location: 'Chicago, IL',
        timezone: 'America/Chicago',
        bio: 'Specialized in financial data analysis and compliance monitoring.',
        dateJoined: '2022-06-01',
        lastLogin: new Date().toISOString(),
        isActive: true,
        isEmailVerified: true,
        isTwoFactorEnabled: false,
        preferences: defaultPreferences,
        permissions: ROLE_PERMISSIONS.analyst,
      },
    },
    {
      email: 'demo@clearanceiq.com',
      password: 'demo123',
      user: {
        id: 'usr_003',
        email: 'demo@clearanceiq.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'viewer' as const,
        department: 'Advisory Services',
        title: 'Consultant',
        phone: '+1 (555) 345-6789',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        bio: 'Demo account for platform exploration.',
        dateJoined: '2024-01-01',
        lastLogin: new Date().toISOString(),
        isActive: true,
        isEmailVerified: true,
        isTwoFactorEnabled: false,
        preferences: defaultPreferences,
        permissions: ROLE_PERMISSIONS.viewer,
      },
    },
  ];

  demoUsers.forEach(({ email, password, user }) => {
    userDatabase.set(email.toLowerCase(), { user, password });
  });
};

initializeDemoUsers();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      securityLogs: [],

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userRecord = userDatabase.get(credentials.email.toLowerCase());
        
        if (!userRecord || userRecord.password !== credentials.password) {
          const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
            userId: 'unknown',
            action: 'failed_login',
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
            status: 'failed',
            details: `Failed login attempt for ${credentials.email}`,
          };
          get().addSecurityLog(log);
          
          set({ 
            isLoading: false, 
            error: 'Invalid email or password. Please try again.' 
          });
          return false;
        }

        const user = {
          ...userRecord.user,
          lastLogin: new Date().toISOString(),
        };

        const session: AuthSession = {
          accessToken: `at_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          refreshToken: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          expiresAt: Date.now() + (credentials.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
          user,
        };

        const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
          userId: user.id,
          action: 'login',
          ipAddress: '192.168.1.1',
          userAgent: navigator.userAgent,
          status: 'success',
          details: 'User logged in successfully',
        };
        get().addSecurityLog(log);

        set({
          user,
          session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      },

      register: async (data: RegistrationData) => {
        set({ isLoading: true, error: null });
        
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (userDatabase.has(data.email.toLowerCase())) {
          set({ 
            isLoading: false, 
            error: 'An account with this email already exists.' 
          });
          return false;
        }

        if (data.password !== data.confirmPassword) {
          set({ 
            isLoading: false, 
            error: 'Passwords do not match.' 
          });
          return false;
        }

        if (data.password.length < 8) {
          set({ 
            isLoading: false, 
            error: 'Password must be at least 8 characters long.' 
          });
          return false;
        }

        const newUser: User = {
          id: `usr_${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'viewer',
          department: data.department,
          title: data.title,
          dateJoined: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString(),
          isActive: true,
          isEmailVerified: false,
          isTwoFactorEnabled: false,
          preferences: defaultPreferences,
          permissions: ROLE_PERMISSIONS.viewer,
        };

        userDatabase.set(data.email.toLowerCase(), {
          user: newUser,
          password: data.password,
        });

        set({ isLoading: false, error: null });
        return true;
      },

      logout: () => {
        const user = get().user;
        if (user) {
          const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
            userId: user.id,
            action: 'logout',
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
            status: 'success',
            details: 'User logged out',
          };
          get().addSecurityLog(log);
        }

        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
        });
      },

      forgotPassword: async (_email: string) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would send an email
        set({ isLoading: false });
        return true;
      },

      resetPassword: async (_token: string, _newPassword: string) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would validate the token and update the password
        set({ isLoading: false });
        return true;
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: false, error: 'No user logged in' });
          return false;
        }

        const updatedUser = { ...currentUser, ...updates };
        
        // Update in database
        const userRecord = userDatabase.get(currentUser.email.toLowerCase());
        if (userRecord) {
          userDatabase.set(currentUser.email.toLowerCase(), {
            ...userRecord,
            user: updatedUser,
          });
        }

        const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
          userId: currentUser.id,
          action: 'profile_update',
          ipAddress: '192.168.1.1',
          userAgent: navigator.userAgent,
          status: 'success',
          details: `Profile updated: ${Object.keys(updates).join(', ')}`,
        };
        get().addSecurityLog(log);

        set({
          user: updatedUser,
          session: get().session ? { ...get().session!, user: updatedUser } : null,
          isLoading: false,
        });

        return true;
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 300));

        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: false, error: 'No user logged in' });
          return false;
        }

        const updatedPreferences = {
          ...currentUser.preferences,
          ...preferences,
          notifications: {
            ...currentUser.preferences.notifications,
            ...(preferences.notifications || {}),
          },
          dashboard: {
            ...currentUser.preferences.dashboard,
            ...(preferences.dashboard || {}),
          },
          accessibility: {
            ...currentUser.preferences.accessibility,
            ...(preferences.accessibility || {}),
          },
        };

        const updatedUser = { ...currentUser, preferences: updatedPreferences };

        set({
          user: updatedUser,
          session: get().session ? { ...get().session!, user: updatedUser } : null,
          isLoading: false,
        });

        return true;
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: false, error: 'No user logged in' });
          return false;
        }

        const userRecord = userDatabase.get(currentUser.email.toLowerCase());
        if (!userRecord || userRecord.password !== currentPassword) {
          set({ isLoading: false, error: 'Current password is incorrect' });
          return false;
        }

        if (newPassword.length < 8) {
          set({ isLoading: false, error: 'New password must be at least 8 characters' });
          return false;
        }

        userDatabase.set(currentUser.email.toLowerCase(), {
          ...userRecord,
          password: newPassword,
        });

        const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
          userId: currentUser.id,
          action: 'password_change',
          ipAddress: '192.168.1.1',
          userAgent: navigator.userAgent,
          status: 'success',
          details: 'Password changed successfully',
        };
        get().addSecurityLog(log);

        set({ isLoading: false });
        return true;
      },

      enableTwoFactor: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock 2FA secret and QR code
        const secret = 'JBSWY3DPEHPK3PXP';
        const qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        
        const currentUser = get().user;
        if (currentUser) {
          const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
            userId: currentUser.id,
            action: 'two_factor_enable',
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
            status: 'success',
            details: 'Two-factor authentication enabled',
          };
          get().addSecurityLog(log);
        }

        return { secret, qrCode };
      },

      disableTwoFactor: async (code: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Validate code (mock)
        if (code.length !== 6) {
          return false;
        }

        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, isTwoFactorEnabled: false };
          set({ user: updatedUser });

          const log: Omit<SecurityLog, 'id' | 'timestamp'> = {
            userId: currentUser.id,
            action: 'two_factor_disable',
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
            status: 'success',
            details: 'Two-factor authentication disabled',
          };
          get().addSecurityLog(log);
        }

        return true;
      },

      verifyEmail: async (_token: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, isEmailVerified: true };
          set({ user: updatedUser });
        }

        return true;
      },

      refreshSession: async () => {
        const session = get().session;
        if (!session) return false;

        if (Date.now() > session.expiresAt) {
          get().logout();
          return false;
        }

        const newSession: AuthSession = {
          ...session,
          accessToken: `at_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        set({ session: newSession });
        return true;
      },

      clearError: () => set({ error: null }),

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => {
        const newLog: SecurityLog = {
          ...log,
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        set(state => ({
          securityLogs: [newLog, ...state.securityLogs].slice(0, 100),
        }));
      },
    }),
    {
      name: 'clearanceiq-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        securityLogs: state.securityLogs,
      }),
    }
  )
);
