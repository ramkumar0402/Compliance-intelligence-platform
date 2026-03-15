import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomeDashboard } from './modules/HomeDashboard';
import { DataQuality } from './modules/DataQuality';
import { EntityMapper } from './modules/EntityMapper';
import { IndependenceChecker } from './modules/IndependenceChecker';
import KPIMonitor from './modules/KPIMonitor';
import Reconciliation from './modules/Reconciliation';
import ReportGenerator from './modules/ReportGenerator';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Toast } from './components/ui/Toast';
import { CommandPalette } from './components/ui/CommandPalette';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useStore } from './store/useStore';

type Module = 
  | 'home' 
  | 'data-quality' 
  | 'entity-mapper' 
  | 'independence' 
  | 'kpi-monitor' 
  | 'reconciliation' 
  | 'reports'
  | 'profile'
  | 'settings';

type AuthPage = 'login' | 'register' | 'forgot-password';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { toasts, removeToast, isCommandPaletteOpen, closeCommandPalette } = useStore();
  
  const [activeModule, setActiveModule] = useState<Module>('home');
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useStore.getState().openCommandPalette();
      }

      // Module navigation shortcuts (G + key)
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        const handleSecondKey = (e2: KeyboardEvent) => {
          const shortcuts: Record<string, Module> = {
            'h': 'home',
            'd': 'data-quality',
            'e': 'entity-mapper',
            'i': 'independence',
            'k': 'kpi-monitor',
            'r': 'reconciliation',
            'p': 'reports',
          };
          if (shortcuts[e2.key]) {
            setActiveModule(shortcuts[e2.key]);
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        document.addEventListener('keydown', handleSecondKey, { once: true });
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render auth pages if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'login') {
      return (
        <LoginPage
          onNavigateToRegister={() => setAuthPage('register')}
          onNavigateToForgotPassword={() => setAuthPage('forgot-password')}
        />
      );
    }
    if (authPage === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setAuthPage('login')}
          onRegistrationSuccess={() => setAuthPage('login')}
        />
      );
    }
    if (authPage === 'forgot-password') {
      return (
        <ForgotPasswordPage
          onNavigateToLogin={() => setAuthPage('login')}
        />
      );
    }
  }

  const handleModuleChange = (module: string) => {
    setActiveModule(module as Module);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomeDashboard onNavigate={handleModuleChange} />;
      case 'data-quality':
        return <DataQuality />;
      case 'entity-mapper':
        return <EntityMapper />;
      case 'independence':
        return <IndependenceChecker />;
      case 'kpi-monitor':
        return <KPIMonitor />;
      case 'reconciliation':
        return <Reconciliation />;
      case 'reports':
        return <ReportGenerator />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomeDashboard onNavigate={handleModuleChange} />;
    }
  };

  const getModuleTitle = () => {
    const titles: Record<Module, string> = {
      'home': 'Dashboard',
      'data-quality': 'Data Quality Audit',
      'entity-mapper': 'Entity Structure Mapper',
      'independence': 'Independence Checker',
      'kpi-monitor': 'KPI Monitor',
      'reconciliation': 'Reconciliation',
      'reports': 'Report Generator',
      'profile': 'My Profile',
      'settings': 'Settings',
    };
    return titles[activeModule];
  };

  const commands = [
    { id: 'home', label: 'Go to Dashboard', shortcut: 'G H', action: () => setActiveModule('home'), group: 'Navigation' },
    { id: 'data-quality', label: 'Go to Data Quality', shortcut: 'G D', action: () => setActiveModule('data-quality'), group: 'Navigation' },
    { id: 'entity-mapper', label: 'Go to Entity Mapper', shortcut: 'G E', action: () => setActiveModule('entity-mapper'), group: 'Navigation' },
    { id: 'independence', label: 'Go to Independence Checker', shortcut: 'G I', action: () => setActiveModule('independence'), group: 'Navigation' },
    { id: 'kpi-monitor', label: 'Go to KPI Monitor', shortcut: 'G K', action: () => setActiveModule('kpi-monitor'), group: 'Navigation' },
    { id: 'reconciliation', label: 'Go to Reconciliation', shortcut: 'G R', action: () => setActiveModule('reconciliation'), group: 'Navigation' },
    { id: 'reports', label: 'Go to Reports', shortcut: 'G P', action: () => setActiveModule('reports'), group: 'Navigation' },
    { id: 'profile', label: 'Go to Profile', action: () => setActiveModule('profile'), group: 'Account' },
    { id: 'settings', label: 'Go to Settings', action: () => setActiveModule('settings'), group: 'Account' },
    { id: 'logout', label: 'Sign Out', action: () => useAuthStore.getState().logout(), group: 'Account' },
  ];

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          activeModule={activeModule} 
          onModuleChange={handleModuleChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Header */}
          <Header 
            title={getModuleTitle()} 
            user={user}
            onProfileClick={() => setActiveModule('profile')}
            onSettingsClick={() => setActiveModule('settings')}
          />

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            <ErrorBoundary>
              {renderModule()}
            </ErrorBoundary>
          </main>
        </div>

        {/* Command Palette */}
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          commands={commands}
        />

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
