import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

interface NotificationCenterProps {
  onNavigate?: (url: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAll 
  } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-96 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-navy-100 text-navy-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      We'll notify you when something happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'relative px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group',
                          !notification.read && 'bg-blue-50/50'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Unread indicator */}
                        {!notification.read && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                        )}

                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {notification.module && (
                                <span className="text-xs text-gray-400">
                                  {notification.module}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100"
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm text-navy-600 hover:text-navy-700 font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
