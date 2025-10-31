import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Activity,
  FileText,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  Archive,
  Eye,
  ChevronRight,
  Pill,
  Microscope,
  Heart,
  Brain
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'critical', label: 'Critical', icon: AlertCircle },
    { id: 'clinical', label: 'Clinical', icon: Activity },
    { id: 'operational', label: 'Operational', icon: TrendingUp },
    { id: 'system', label: 'System', icon: Settings },
  ];

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.category === activeFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [notifications, activeFilter, searchQuery]);

  const getPriorityConfig = (priority) => {
    const configs = {
      critical: {
        borderColor: 'border-alert-500',
        iconBg: 'bg-alert-100',
        iconColor: 'text-alert-600',
        icon: AlertCircle,
      },
      high: {
        borderColor: 'border-warning-500',
        iconBg: 'bg-warning-100',
        iconColor: 'text-warning-600',
        icon: AlertTriangle,
      },
      medium: {
        borderColor: 'border-blue-500',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: Info,
      },
      low: {
        borderColor: 'border-gray-400',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        icon: Info,
      },
    };
    return configs[priority] || configs.low;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      clinical: Activity,
      operational: TrendingUp,
      workflow: FileText,
      quality: CheckCheck,
      system: Settings,
      drug: Pill,
      research: Microscope,
    };
    return icons[category] || Bell;
  };

  return (
    <div className="notification-panel w-96">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Notifications ({unreadCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white placeholder-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${activeFilter === filter.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Mark all as read
        </button>
        <button className="p-1 text-gray-600 hover:text-primary-600 rounded transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar bg-white">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm text-center">
              {searchQuery
                ? 'No notifications match your search'
                : 'No notifications to display'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          View Archive
        </button>
      </div>
    </div>
  );
};

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const priorityConfig = getPriorityConfig(notification.priority);
  const PriorityIcon = priorityConfig.icon;
  const CategoryIcon = getCategoryIcon(notification.category);

  const handleAction = (action) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Handle action routing here
    console.log('Action:', action, 'Notification:', notification.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        px-4 py-3 cursor-pointer transition-colors
        ${!notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
        border-l-4 ${priorityConfig.borderColor}
      `}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 ${priorityConfig.iconBg} rounded-full flex items-center justify-center`}>
          <PriorityIcon className={`w-5 h-5 ${priorityConfig.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <div className="flex items-start justify-between mb-1">
            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'} line-clamp-1`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full ml-2 mt-1.5" />
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {notification.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span className="capitalize">{notification.category}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(action);
                  }}
                  className={`
                    text-xs px-3 py-1.5 rounded-md font-medium transition-colors
                    ${action.primary
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions
const getPriorityConfig = (priority) => {
  const configs = {
    critical: {
      borderColor: 'border-alert-500',
      iconBg: 'bg-alert-100',
      iconColor: 'text-alert-600',
      icon: AlertCircle,
    },
    high: {
      borderColor: 'border-warning-500',
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      icon: AlertTriangle,
    },
    medium: {
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: Info,
    },
    low: {
      borderColor: 'border-gray-400',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      icon: Info,
    },
  };
  return configs[priority] || configs.low;
};

const getCategoryIcon = (category) => {
  const icons = {
    clinical: Activity,
    operational: TrendingUp,
    workflow: FileText,
    quality: CheckCheck,
    system: Settings,
    drug: Pill,
    research: Microscope,
  };
  return icons[category] || Bell;
};

export default NotificationPanel;
