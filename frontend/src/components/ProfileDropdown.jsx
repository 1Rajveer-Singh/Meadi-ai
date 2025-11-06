import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Bell,
  Palette,
  Shield,
  Building,
  Smartphone,
  CreditCard,
  HelpCircle,
  BookOpen,
  LogOut,
  Activity,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProfileDropdown = ({ onClose }) => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const user = {
    name: authUser?.name || "Dr. Jennifer Martinez",
    role:
      authUser?.specialization ||
      authUser?.role ||
      "Radiologist - Cardiac Imaging",
    department: authUser?.department || "Radiology",
    email: authUser?.email || "j.martinez@hospital.com",
    status: "active",
    avatar:
      authUser?.avatar ||
      authUser?.name?.substring(0, 2)?.toUpperCase() ||
      "JM",
  };

  const statusColors = {
    active: "bg-health-500",
    away: "bg-warning-500",
    busy: "bg-alert-500",
    offline: "bg-gray-400",
  };

  const quickActions = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Shield, label: "Safety", path: "/drug-checker" },
    { icon: TrendingUp, label: "Insights", path: "/analytics" },
  ];

  const settingsMenu = [];

  const handleStatusChange = (newStatus) => {
    console.log("Changing status to:", newStatus);
    // Implement status change logic
  };

  const handleLogout = async () => {
    try {
      onClose();
      const result = await logout();
      if (result?.redirect) {
        navigate(result.redirect);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-notification overflow-hidden"
    >
      {/* User Identity Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 px-4 py-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
              {user.avatar}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 ${
                statusColors[user.status]
              } border-2 border-white rounded-full`}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1">
              {user.name}
            </h3>
            <p className="text-blue-100 text-sm leading-tight mb-1">
              {user.role}
            </p>
            <p className="text-blue-200 text-xs">
              Department: {user.department}
            </p>

            {/* Status Selector */}
            <div className="mt-3">
              <div className="relative">
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white text-xs font-medium transition-colors">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      statusColors[user.status]
                    }`}
                  />
                  <span className="capitalize">{user.status}</span>
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings Menu - Hidden since empty */}
      {settingsMenu.length > 0 && (
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {settingsMenu.map((section, index) => (
            <div
              key={section.section}
              className={index > 0 ? "border-t border-gray-200" : ""}
            >
              <div className="px-4 py-2 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h4>
              </div>
              <div className="py-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-gray-700 hover:text-primary-600 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${
                            item.badge === "New"
                              ? "bg-health-100 text-health-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-alert-50 hover:bg-alert-100 dark:bg-alert-900/30 dark:hover:bg-alert-900/50 text-alert-600 hover:text-alert-700 dark:text-alert-400 dark:hover:text-alert-300 rounded-lg font-medium text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileDropdown;
