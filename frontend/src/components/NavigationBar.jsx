import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  User, 
  Users,
  ChevronDown,
  X,
  Check,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Settings,
  Filter,
  Sparkles,
  LayoutDashboard,
  Stethoscope,
  Shield,
  TrendingUp,
  Plus,
  Zap,
  Heart,
  Brain,
  Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';
import ProfileDropdown from './ProfileDropdown';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

const NavigationBar = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time user updates
  useEffect(() => {
    setCurrentUser(user);
    
    const handleUserUpdate = (event) => {
      setCurrentUser(event.detail);
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [user]);

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized Navigation Structure (5 items instead of 7)
  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Hospital Overview',
      color: 'blue'
    },
    { 
      path: '/patients', 
      label: 'Patients', 
      icon: Users,
      description: 'Patient Management',
      badge: '247',
      color: 'green'
    },
    { 
      path: '/analyze', 
      label: 'Analyze', 
      icon: Zap,
      description: 'AI Analysis Hub',
      highlight: true,
      color: 'primary',
      subPaths: ['/diagnosis/new', '/analysis/images', '/diagnosis/processing', '/diagnosis/results']
    },
    { 
      path: '/safety', 
      label: 'Safety', 
      icon: Shield,
      description: 'Safety & Guidelines',
      color: 'red',
      subPaths: ['/drug-checker']
    },
    { 
      path: '/insights', 
      label: 'Insights', 
      icon: TrendingUp,
      description: 'Analytics & Research',
      color: 'purple',
      subPaths: ['/analytics', '/ai-insights', '/research']
    }
  ];

  // Helper function to check if current path matches nav item (including sub-paths)
  const isActive = (navItem) => {
    if (location.pathname === navItem.path) return true;
    if (navItem.subPaths) {
      return navItem.subPaths.some(subPath => 
        location.pathname.startsWith(subPath)
      );
    }
    return false;
  };

  // Helper function to get the appropriate link path
  const getLinkPath = (navItem) => {
    // For analyze, route to the primary action
    if (navItem.path === '/analyze') {
      return '/diagnosis/new';
    }
    // For safety, route to drug checker
    if (navItem.path === '/safety') {
      return '/drug-checker';
    }
    // For insights, route to analytics
    if (navItem.path === '/insights') {
      return '/analytics';
    }
    return navItem.path;
  };

  const getColorClasses = (navItem, active) => {
    if (navItem.highlight) {
      return 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-md hover:shadow-lg border-0';
    }
    
    if (active) {
      const colorMap = {
        blue: 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100',
        green: 'bg-green-50 text-green-700 shadow-sm border border-green-100',
        red: 'bg-red-50 text-red-700 shadow-sm border border-red-100',
        purple: 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
      };
      return colorMap[navItem.color] || 'bg-gray-50 text-gray-700 shadow-sm border border-gray-100';
    }
    
    return 'text-gray-700 hover:text-blue-600 hover:bg-gray-50';
  };

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-nav shadow-lg' : 'bg-white/90 backdrop-blur-sm border-b border-gray-200'
    }`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Medical Branding */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Medical pulse animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl blur-lg opacity-40"
                animate={{ 
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-white mr-0.5" />
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                MedGuard <span className="text-gray-900">AI</span>
              </h1>
              <p className="text-xs text-gray-600 font-medium">Unified Hospital Portal</p>
            </div>
            <div className="hidden sm:block lg:hidden">
              <h1 className="text-lg font-bold text-blue-700">MedGuard AI</h1>
            </div>
          </Link>

          {/* Optimized Main Navigation (5 items) */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const linkPath = getLinkPath(item);
              
              return (
                <Link key={item.path} to={linkPath}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative group px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
                      ${getColorClasses(item, active)}
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : ''}`} />
                      <span className="whitespace-nowrap">{item.label}</span>
                      
                      {/* Badge for items like patient count */}
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-semibold rounded-full
                          ${active 
                            ? item.color === 'green' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Highlight animation for primary CTA */}
                      {item.highlight && (
                        <motion.div
                          animate={{ 
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-3 h-3 text-yellow-300" />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced tooltip on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      whileHover={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                    >
                      {item.description}
                      {/* Show sub-features for consolidated items */}
                      {item.path === '/analyze' && (
                        <div className="text-xs text-gray-300 mt-1">
                          Upload • Images • Emergency
                        </div>
                      )}
                      {item.path === '/insights' && (
                        <div className="text-xs text-gray-300 mt-1">
                          Reports • Analytics • Research
                        </div>
                      )}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </motion.div>
                    
                    {/* Active indicator */}
                    {active && !item.highlight && (
                      <motion.div
                        layoutId="activeNavTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                          item.color === 'green' 
                            ? 'from-green-500 to-green-600'
                            : item.color === 'red'
                            ? 'from-red-500 to-red-600'
                            : item.color === 'purple'
                            ? 'from-purple-500 to-purple-600'
                            : 'from-blue-500 to-blue-600'
                        }`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Compact Navigation for Medium Screens */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const linkPath = getLinkPath(item);
              
              return (
                <Link key={item.path} to={linkPath}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative p-2.5 rounded-lg transition-all duration-200
                      ${active 
                        ? item.color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                      }
                      ${item.highlight 
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
                        : ''
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {item.badge === '247' ? '99+' : item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions - Streamlined */}
          <div className="flex items-center space-x-3">
            {/* Quick Emergency Access */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/diagnosis/new?priority=emergency">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all duration-200 font-medium text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden lg:inline">Emergency</span>
                </motion.button>
              </Link>
              
              {/* Settings Quick Access */}
              <Link to="/settings">
                <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Enhanced Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                aria-label="Medical Alerts & Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping" />
                  </>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full group-hover:bg-blue-500 transition-colors"></div>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-10 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 z-50"
                    >
                      <NotificationPanel onClose={() => setShowNotifications(false)} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Medical Professional Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  {/* Professional Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {currentUser?.avatar || currentUser?.name?.substring(0, 2)?.toUpperCase() || 'DR'}
                    </div>
                    {/* Online status with medical cross */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Doctor Info - Hidden on small screens */}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'Dr. Sarah Johnson'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.profession || currentUser?.role || 'Radiologist'}</p>
                  </div>
                </div>
                
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 z-50"
                  >
                    <ProfileDropdown onClose={() => setShowProfile(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Mobile Navigation (5 items) */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const linkPath = getLinkPath(item);
            
            return (
              <Link
                key={item.path}
                to={linkPath}
                className={`
                  relative flex flex-col items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 min-w-0
                  ${active 
                    ? item.color === 'green'
                      ? 'text-green-600 bg-green-50'
                      : 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                  }
                  ${item.highlight 
                    ? 'bg-gradient-to-t from-blue-600 to-green-600 text-white shadow-md' 
                    : ''
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {item.label}
                </span>
                
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    99+
                  </span>
                )}
                
                {active && !item.highlight && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full ${
                    item.color === 'green' ? 'bg-green-600' : 'bg-blue-600'
                  }`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
