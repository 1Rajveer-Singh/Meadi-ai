import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, User, Settings, LogOut, Shield, 
  Moon, Sun, Globe, HelpCircle, ChevronDown,
  Activity, AlertCircle, CheckCircle, Clock,
  Filter, Calendar, Download, RefreshCw, Zap,
  Brain, Heart, Stethoscope, TrendingUp, Users,
  Upload
} from 'lucide-react';

const Header = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Diagnosis Complete',
      message: 'Patient P-2024-1847 analysis finished with 97.2% confidence',
      time: '2 minutes ago',
      icon: CheckCircle,
      unread: true
    },
    {
      id: 2,
      type: 'alert',
      title: 'Critical Finding',
      message: 'Urgent review required for Patient P-2024-1851',
      time: '5 minutes ago',
      icon: AlertCircle,
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'AI Model Updated',
      message: 'Image Analysis agent updated to v2.1.3',
      time: '1 hour ago',
      icon: Brain,
      unread: false
    },
    {
      id: 4,
      type: 'warning',
      title: 'System Maintenance',
      message: 'Scheduled maintenance in 2 hours',
      time: '2 hours ago',
      icon: Clock,
      unread: false
    }
  ];

  const quickActions = [
    { icon: Upload, label: 'New Diagnosis', path: '/diagnosis/new', color: 'primary' },
    { icon: Users, label: 'Add Patient', path: '/patients/new', color: 'secondary' },
    { icon: Calendar, label: 'Schedule', path: '/calendar', color: 'accent' },
    { icon: Download, label: 'Export Data', action: 'export', color: 'neutral' }
  ];

  const recentSearches = [
    'Patient P-2024-1847',
    'Chest X-ray analysis',
    'Drug interactions',
    'MRI brain scan'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="header-glass px-6 py-4 flex items-center justify-between"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">AgenticAI HealthGuard</h1>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <Activity className="w-3 h-3" />
                <span>4 AI Agents Active</span>
                <span>•</span>
                <TrendingUp className="w-3 h-3 text-secondary-500" />
                <span className="text-secondary-600">System Healthy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="hidden lg:flex items-center space-x-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn-glass-pro ${
                  action.color === 'primary' ? 'btn-glass-primary' :
                  action.color === 'secondary' ? 'btn-glass-success' :
                  action.color === 'accent' ? 'bg-accent-500/10 text-accent-700' :
                  ''
                }`}
                title={action.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8" ref={searchRef}>
        <div className="relative">
          <motion.div
            animate={{ 
              width: showSearch ? '100%' : '300px'
            }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search patients, diagnoses, or insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="input-glass w-full pl-12 pr-10 py-3 text-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 hover:text-neutral-600"
              >
                ×
              </motion.button>
            )}
          </motion.div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full card-glass-pro p-4 rounded-2xl z-50"
              >
                {searchQuery ? (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-neutral-700">Search Results</div>
                    <div className="space-y-2">
                      {/* Mock search results */}
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 cursor-pointer">
                        <Users className="w-4 h-4 text-primary-500" />
                        <div>
                          <div className="text-sm font-medium">Patient Sarah Johnson</div>
                          <div className="text-xs text-neutral-500">ID: P-2024-1847</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 cursor-pointer">
                        <Brain className="w-4 h-4 text-accent-500" />
                        <div>
                          <div className="text-sm font-medium">Chest X-ray Analysis</div>
                          <div className="text-xs text-neutral-500">Recent diagnosis</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-neutral-700">Recent Searches</div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span className="text-sm text-neutral-600">{search}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-full bg-secondary-100 text-secondary-700"
        >
          <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
          <span className="text-xs font-medium">All Systems Operational</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-96 card-glass-pro rounded-2xl z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-800">Notifications</h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-neutral-500">{unreadCount} unread</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          navigate('/settings?section=notifications');
                          setShowNotifications(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title="Notification Settings"
                      >
                        <Settings className="w-4 h-4 text-neutral-600" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        className="p-4 border-b border-white/5 cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'success' ? 'bg-secondary-100 text-secondary-600' :
                            notification.type === 'alert' ? 'bg-error-100 text-error-600' :
                            notification.type === 'warning' ? 'bg-warning-100 text-warning-600' :
                            'bg-primary-100 text-primary-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-neutral-800 truncate">
                                {notification.title}
                              </p>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="p-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      navigate('/settings?section=notifications');
                      setShowNotifications(false);
                    }}
                    className="btn-glass-pro w-full justify-center text-sm"
                  >
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-neutral-600" />
          ) : (
            <Sun className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-neutral-800">Dr. Sarah Wilson</p>
              <p className="text-xs text-neutral-500">Chief Radiologist</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </motion.button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-64 card-glass-pro rounded-2xl z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Dr. Sarah Wilson</p>
                      <p className="text-sm text-neutral-500">Chief Radiologist</p>
                      <p className="text-xs text-neutral-400">sarah.wilson@hospital.com</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {[
                    { icon: User, label: 'My Profile', path: '/profile' },
                    { icon: Settings, label: 'Settings', path: '/settings' },
                    { icon: Shield, label: 'Privacy', path: '/privacy' },
                    { icon: HelpCircle, label: 'Help & Support', path: '/help' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-700">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-error-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;