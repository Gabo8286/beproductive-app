import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, default 4000
  autoClose?: boolean; // default true
}

interface MinimalNotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'text-[#34c759]',
  error: 'text-[#ff3b30]',
  info: 'text-[#007aff]',
};

export const MinimalNotification: React.FC<MinimalNotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = iconMap[notification.type];

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto close timer
    if (notification.autoClose !== false) {
      const duration = notification.duration || 4000;
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [notification.autoClose, notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Animation duration
  };

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 z-[200] mx-auto max-w-sm',
        'transform transition-all duration-300 ease-out',
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      )}
    >
      <div className={cn(
        'apple-notification p-4 flex items-start gap-3',
        isVisible && !isExiting ? 'animate-spring-in' : 'animate-spring-out'
      )}>
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center animate-bounce-in',
          notification.type === 'success' && 'bg-[#34c759]',
          notification.type === 'error' && 'bg-[#ff3b30]',
          notification.type === 'info' && 'bg-[#007aff]'
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="apple-page-title text-sm font-semibold text-[#1d1d1f] mb-0">
            {notification.title}
          </div>
          {notification.message && (
            <div className="text-sm text-[#86868b] leading-tight">
              {notification.message}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-[#f5f5f7] transition-colors duration-200 touch-optimized"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-[#86868b]" />
        </button>
      </div>
    </div>
  );
};

// Notification Manager Hook
interface UseNotificationsReturn {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notificationData: Omit<NotificationData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: NotificationData = {
      id,
      autoClose: true,
      duration: 4000,
      ...notificationData,
    };

    setNotifications(prev => {
      // Limit to 3 notifications max, remove oldest
      const newNotifications = [notification, ...prev].slice(0, 3);
      return newNotifications;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

// Notification Container Component
interface NotificationContainerProps {
  notifications: NotificationData[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  if (notifications.length === 0) return null;

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            // Stack notifications with slight offset
            top: `${16 + index * 80}px`,
            zIndex: 200 - index,
          }}
          className="absolute"
        >
          <MinimalNotification
            notification={notification}
            onClose={onClose}
          />
        </div>
      ))}
    </>
  );
};

// Helper functions for quick notifications
export const notificationHelpers = {
  success: (title: string, message?: string) => ({
    type: 'success' as const,
    title,
    message,
  }),

  error: (title: string, message?: string) => ({
    type: 'error' as const,
    title,
    message,
  }),

  info: (title: string, message?: string) => ({
    type: 'info' as const,
    title,
    message,
  }),
};