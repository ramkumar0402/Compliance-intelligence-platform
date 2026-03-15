import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Save,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Volume2,
  Mail,
  Clock,
  FileText,
  Database,
  BarChart3,
  Trash2,
  Download,
  History
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

type SettingsTab = 'general' | 'notifications' | 'security' | 'appearance' | 'privacy';

export const SettingsPage: React.FC = () => {
  const { user, updatePreferences, changePassword, securityLogs, logout, isLoading } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');

  if (!user) return null;

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePreferenceChange = async (key: string, value: unknown) => {
    const keys = key.split('.');
    let update: Record<string, unknown> = {};
    
    if (keys.length === 1) {
      update = { [key]: value };
    } else if (keys.length === 2) {
      update = { [keys[0]]: { [keys[1]]: value } };
    } else if (keys.length === 3) {
      update = { [keys[0]]: { [keys[1]]: { [keys[2]]: value } } };
    }

    const success = await updatePreferences(update as Parameters<typeof updatePreferences>[0]);
    if (success) {
      showSuccessNotification('Settings saved successfully');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccessNotification('Password changed successfully');
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'privacy' as const, label: 'Privacy', icon: Eye },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg animate-enter">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Regional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={user.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select
                      value={user.preferences.dateFormat}
                      onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                    <select
                      value={user.preferences.timeFormat}
                      onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={user.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  Dashboard Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Welcome Message</p>
                      <p className="text-sm text-gray-500">Display welcome message on dashboard</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.preferences.dashboard.showWelcomeMessage}
                        onChange={(e) => handlePreferenceChange('dashboard.showWelcomeMessage', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-refresh Interval</label>
                    <select
                      value={user.preferences.dashboard.refreshInterval}
                      onChange={(e) => handlePreferenceChange('dashboard.refreshInterval', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Disabled</option>
                      <option value={15000}>15 seconds</option>
                      <option value={30000}>30 seconds</option>
                      <option value={60000}>1 minute</option>
                      <option value={300000}>5 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recent Items to Show</label>
                    <select
                      value={user.preferences.dashboard.recentItemsCount}
                      onChange={(e) => handlePreferenceChange('dashboard.recentItemsCount', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 items</option>
                      <option value={10}>10 items</option>
                      <option value={15}>15 items</option>
                      <option value={20}>20 items</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gray-400" />
                  Notification Channels
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications within the platform', icon: Monitor },
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications', icon: Smartphone },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.preferences.notifications[item.key as 'inApp' | 'email' | 'push']}
                          onChange={(e) => handlePreferenceChange(`notifications.${item.key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Email Digest Frequency
                    </span>
                  </label>
                  <select
                    value={user.preferences.notifications.digest}
                    onChange={(e) => handlePreferenceChange('notifications.digest', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                  Alert Severity
                </h3>
                <p className="text-sm text-gray-500 mb-4">Choose which alert levels to receive notifications for</p>
                <div className="space-y-3">
                  {[
                    { key: 'critical', label: 'Critical', desc: 'Immediate action required', color: 'red' },
                    { key: 'high', label: 'High', desc: 'Review within 24 hours', color: 'orange' },
                    { key: 'medium', label: 'Medium', desc: 'Review within 1 week', color: 'yellow' },
                    { key: 'low', label: 'Low', desc: 'Informational', color: 'blue' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.preferences.notifications.alerts[item.key as 'critical' | 'high' | 'medium' | 'low']}
                          onChange={(e) => handlePreferenceChange(`notifications.alerts.${item.key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  Module Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-4">Choose which modules to receive notifications from</p>
                <div className="space-y-3">
                  {[
                    { key: 'dataQuality', label: 'Data Quality', icon: FileText },
                    { key: 'independence', label: 'Independence Checks', icon: Shield },
                    { key: 'kpiMonitor', label: 'KPI Monitor', icon: BarChart3 },
                    { key: 'reconciliation', label: 'Reconciliation', icon: Database },
                    { key: 'reports', label: 'Reports', icon: FileText },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.preferences.notifications.modules[item.key as keyof typeof user.preferences.notifications.modules]}
                          onChange={(e) => handlePreferenceChange(`notifications.modules.${item.key}`, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-gray-400" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.isTwoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.isTwoFactorEnabled 
                        ? 'Your account is protected with two-factor authentication' 
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium ${
                    user.isTwoFactorEnabled 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}>
                    {user.isTwoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  Recent Security Activity
                </h3>
                <div className="space-y-3">
                  {securityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {log.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {log.action.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">{log.ipAddress}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  ))}
                  {securityLogs.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No security activity logged</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-gray-400" />
                  Active Sessions
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">This device • Active now</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                </div>
                <button
                  onClick={logout}
                  className="mt-4 w-full py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of All Devices
                </button>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-400" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handlePreferenceChange('theme', theme.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        user.preferences.theme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <theme.icon className={`w-8 h-8 mx-auto mb-2 ${
                        user.preferences.theme === theme.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`font-medium ${
                        user.preferences.theme === theme.value ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {theme.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  Accessibility
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <select
                      value={user.preferences.accessibility.fontSize}
                      onChange={(e) => handlePreferenceChange('accessibility.fontSize', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium (Default)</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Reduced Motion</p>
                      <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.preferences.accessibility.reducedMotion}
                        onChange={(e) => handlePreferenceChange('accessibility.reducedMotion', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">High Contrast</p>
                      <p className="text-sm text-gray-500">Increase color contrast for better visibility</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.preferences.accessibility.highContrast}
                        onChange={(e) => handlePreferenceChange('accessibility.highContrast', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-400" />
                  Data Export
                </h3>
                <p className="text-gray-600 mb-4">
                  Download a copy of all your data stored on ClearanceIQ
                </p>
                <button className="px-4 py-2.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Request Data Export
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
