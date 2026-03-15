// Authentication Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  title: string;
  avatar?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  dateJoined: string;
  lastLogin: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  preferences: UserPreferences;
  permissions: string[];
}

export type UserRole = 'admin' | 'senior_analyst' | 'analyst' | 'viewer';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: string;
  currency: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'none';
  alerts: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  modules: {
    dataQuality: boolean;
    independence: boolean;
    kpiMonitor: boolean;
    reconciliation: boolean;
    reports: boolean;
  };
}

export interface DashboardPreferences {
  defaultView: string;
  refreshInterval: number;
  showWelcomeMessage: boolean;
  pinnedModules: string[];
  recentItemsCount: number;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  title: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: SecurityAction;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  status: 'success' | 'failed';
  details?: string;
}

export type SecurityAction = 
  | 'login'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'profile_update'
  | 'two_factor_enable'
  | 'two_factor_disable'
  | 'session_refresh'
  | 'failed_login';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'reports.view', 'reports.create', 'reports.approve', 'reports.delete',
    'data.view', 'data.create', 'data.edit', 'data.delete',
    'independence.view', 'independence.create', 'independence.approve',
    'settings.view', 'settings.edit',
    'audit.view', 'audit.export',
  ],
  senior_analyst: [
    'reports.view', 'reports.create', 'reports.approve',
    'data.view', 'data.create', 'data.edit',
    'independence.view', 'independence.create', 'independence.approve',
    'settings.view',
    'audit.view',
  ],
  analyst: [
    'reports.view', 'reports.create',
    'data.view', 'data.create', 'data.edit',
    'independence.view', 'independence.create',
    'settings.view',
  ],
  viewer: [
    'reports.view',
    'data.view',
    'independence.view',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  senior_analyst: 'Senior Analyst',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export const DEPARTMENTS = [
  'Risk Management Services',
  'Audit & Assurance',
  'Tax Services',
  'Advisory Services',
  'Transaction Advisory',
  'Forensic & Integrity Services',
  'Technology Consulting',
  'Finance & Accounting',
  'Legal & Compliance',
  'Human Resources',
  'Operations',
  'Other',
];

export const TITLES = [
  'Partner',
  'Senior Manager',
  'Manager',
  'Senior Consultant',
  'Consultant',
  'Senior Associate',
  'Associate',
  'Analyst',
  'Intern',
];
