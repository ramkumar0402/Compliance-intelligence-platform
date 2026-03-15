import { 
  LayoutDashboard, 
  FileSearch, 
  GitBranch, 
  Shield, 
  TrendingUp, 
  Scale, 
  FileText,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'data-quality', label: 'Data Quality', icon: FileSearch },
  { id: 'entity-mapper', label: 'Entity Mapper', icon: GitBranch },
  { id: 'independence', label: 'Independence', icon: Shield },
  { id: 'kpi-monitor', label: 'KPI Monitor', icon: TrendingUp },
  { id: 'reconciliation', label: 'Reconciliation', icon: Scale },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const bottomMenuItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { logout, user } = useAuthStore();

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 bg-navy-900 text-white flex flex-col transition-all duration-300 z-40",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight">ClearanceIQ</h1>
              <p className="text-xs text-blue-300">Compliance Analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-navy-700 rounded-full flex items-center justify-center border border-navy-600 hover:bg-navy-600 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User Info */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-blue-300 truncate">{user.role === 'admin' ? 'Administrator' : user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-blue-100 hover:bg-navy-700 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-navy-700 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-100 hover:bg-navy-700 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
        <button 
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
