import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Bell,
  Palette,
  Shield,
  Link as LinkIcon,
  Stethoscope,
  Brain,
  Users,
  FileText,
  Scale,
  Database,
  Globe,
  Smartphone,
  GraduationCap,
  CreditCard,
  ChevronRight,
  Save,
  RotateCcw,
  LogOut,
  AlertCircle,
  CheckCircle,
  Mail,
  Smartphone as Phone,
  Clock,
  Activity,
  RefreshCw,
  Trash2,
  Filter,
} from "lucide-react";
import SimpleLayout from "../components/layouts/SimpleLayout";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    diagnosis_alerts: true,
    critical_findings: true,
    ai_updates: true,
    system_maintenance: true,
    patient_updates: true,
    collaboration_requests: true,
    daily_summary: true,
    weekly_report: false,
  });
  const [alertRules, setAlertRules] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const sections = [
    { id: "profile", label: "Personal Profile", icon: User },
    {
      id: "account",
      label: "Account & Sign Out",
      icon: LogOut,
      highlight: true,
    },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "security", label: "Security & Authentication", icon: Shield },
    { id: "integrations", label: "Integrations & Connections", icon: LinkIcon },
    {
      id: "ai",
      label: "AI Configuration & Tuning",
      icon: Brain,
      isLink: true,
      path: "/settings/ai-configuration",
    },
    {
      id: "team",
      label: "Team & Collaboration",
      icon: Users,
      isLink: true,
      path: "/settings/team-collaboration",
    },
    { id: "compliance", label: "Compliance & Audit", icon: Scale },
    { id: "data", label: "Data & Backup", icon: Database },
    { id: "mobile", label: "Mobile & Devices", icon: Smartphone },
    { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  ];

  // Handle URL parameters for direct section navigation
  useEffect(() => {
    const section = searchParams.get("section");
    const sectionConfig = sections.find((s) => s.id === section);
    // Only set active section if it's not a link (doesn't navigate to a separate page)
    if (section && sectionConfig && !sectionConfig.isLink) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Fetch notifications when the notifications section is active
  useEffect(() => {
    if (activeSection === "notifications") {
      fetchNotifications();
      fetchNotificationStats();
      fetchNotificationPreferences();
      fetchAlertRules();
    }
  }, [activeSection, filterUnreadOnly, selectedCategory]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const params = new URLSearchParams({
        skip: "0",
        limit: "50",
        unread_only: filterUnreadOnly.toString(),
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/list?${params}`
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/stats`
      );
      if (response.data.success) {
        setNotificationStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/preferences`
      );
      if (response.data) {
        setNotificationPreferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/alerts`
      );
      if (response.data.success) {
        setAlertRules(response.data.alert_rules || []);
      }
    } catch (error) {
      console.error("Error fetching alert rules:", error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/notifications/mark-read/${notificationId}`
      );
      fetchNotifications();
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification:", error);
      toast.error("Failed to mark notification");
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`);
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${notificationId}`);
      fetchNotifications();
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const updateNotificationPreferences = async (newPreferences) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/preferences`,
        newPreferences
      );
      setNotificationPreferences(newPreferences);
      setHasChanges(false);
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const toggleAlertRule = async (ruleId, enabled) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/alert-rules/${ruleId}`,
        {
          enabled,
        }
      );
      fetchAlertRules();
      toast.success(`Alert rule ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling alert rule:", error);
      toast.error("Failed to update alert rule");
    }
  };

  const handlePreferenceChange = (key, value) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "alert":
      case "critical":
        return AlertCircle;
      case "warning":
        return Bell;
      default:
        return Activity;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100";
      case "alert":
        return "text-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 bg-red-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      setIsLoggingOut(true);
      try {
        const result = await logout();
        toast.success("Successfully signed out!");
        if (result?.redirect) {
          navigate(result.redirect);
        }
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to sign out. Please try again.");
        setIsLoggingOut(false);
      }
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.avatar || user?.name?.substring(0, 2)?.toUpperCase() || "DR"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {user?.name || "Doctor"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {user?.email || "email@example.com"}
            </p>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user?.name || ""}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={() => setHasChanges(true)}
              >
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Oncology</option>
                <option>General Medicine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specialization
              </label>
              <input
                type="text"
                defaultValue={user?.specialization || ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={() => setHasChanges(true)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Tell us about yourself..."
              onChange={() => setHasChanges(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-6">
      {/* Account Information Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.avatar || user?.name?.substring(0, 2)?.toUpperCase() || "DR"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {user?.name || "Doctor"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {user?.email || "email@example.com"}
            </p>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active Account
              </span>
              {user?.role && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Department</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.department || "General"}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Specialization
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.specialization || "Medical Professional"}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Account Type
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.email?.includes("admin")
                ? "Administrator"
                : user?.email?.includes("researcher")
                ? "Researcher"
                : "Medical Professional"}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600 dark:text-gray-400">
              Member Since
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              October 2025
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sign Out
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Securely sign out of your account. You'll need to log in again to
              access the system.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out of Account</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Security Tip</p>
            <p>
              Always sign out when using shared devices or public computers to
              protect your account security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={() => setHasChanges(true)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={() => setHasChanges(true)}
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Two-Factor Authentication
        </h3>
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Add an extra layer of security to your account. When enabled,
              you'll need to enter a code from your phone in addition to your
              password.
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
              Enable 2FA
            </button>
          </div>
          <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Active Sessions
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Current Session
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Windows • Chrome • Active now
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSection = () => (
    <div className="space-y-6">
      {/* Connected Services */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Connected Services
        </h3>
        <div className="space-y-3">
          {[
            { name: "PACS System", status: "Connected", icon: Activity },
            { name: "EMR Integration", status: "Connected", icon: FileText },
            { name: "Lab Systems", status: "Pending", icon: Brain },
          ].map((service, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <service.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {service.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status:{" "}
                    <span
                      className={
                        service.status === "Connected"
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }
                    >
                      {service.status}
                    </span>
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-all">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          API Keys
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Manage API keys for third-party integrations and custom applications.
        </p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
          Generate New API Key
        </button>
      </div>
    </div>
  );

  const renderComplianceSection = () => (
    <div className="space-y-6">
      {/* Compliance Status */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              HIPAA Compliant
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your account meets all HIPAA compliance requirements
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Audit Logs
        </h3>
        <div className="space-y-3">
          {[
            { action: "Login", time: "2 hours ago", status: "Success" },
            { action: "Data Export", time: "1 day ago", status: "Success" },
            {
              action: "Settings Change",
              time: "3 days ago",
              status: "Success",
            },
          ].map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {log.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {log.time}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                {log.status}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          View Full Audit Log
        </button>
      </div>

      {/* Compliance Certificates */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Compliance Certificates
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {["HIPAA", "GDPR", "SOC 2", "ISO 27001"].map((cert) => (
            <div
              key={cert}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
            >
              <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {cert}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Certified
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataBackupSection = () => (
    <div className="space-y-6">
      {/* Backup Status */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Last Backup
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Successfully completed 2 hours ago
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Backup Progress
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  100%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Backup Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Automatic Backups
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily at 2:00 AM
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
                onChange={() => setHasChanges(true)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Cloud Storage
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Store backups in cloud
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
                onChange={() => setHasChanges(true)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Backups
        </h3>
        <div className="space-y-3">
          {[
            {
              date: "Nov 5, 2025 02:00 AM",
              size: "2.4 GB",
              status: "Completed",
            },
            {
              date: "Nov 4, 2025 02:00 AM",
              size: "2.3 GB",
              status: "Completed",
            },
            {
              date: "Nov 3, 2025 02:00 AM",
              size: "2.2 GB",
              status: "Completed",
            },
          ].map((backup, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {backup.date}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Size: {backup.size}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                  {backup.status}
                </span>
                <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
            Create Backup Now
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-all">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderMobileDevicesSection = () => (
    <div className="space-y-6">
      {/* Mobile App */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Mobile App Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Download our mobile app for iOS and Android
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
                App Store
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                Google Play
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Connected Devices
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  iPhone 15 Pro
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last active: 1 hour ago
                </p>
              </div>
            </div>
            <button className="text-red-600 dark:text-red-400 hover:underline text-sm">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Sync Settings
        </h3>
        <div className="space-y-3">
          {["Sync Patient Data", "Sync Images", "Sync Reports"].map(
            (item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <p className="text-gray-900 dark:text-gray-100">{item}</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                    onChange={() => setHasChanges(true)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Professional Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              $99/month • Billed monthly
            </p>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                Active
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Renews on Dec 5, 2025
              </span>
            </div>
          </div>
          <CreditCard className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payment Method
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                •••• •••• •••• 4242
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expires 12/2026
              </p>
            </div>
          </div>
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Billing History
        </h3>
        <div className="space-y-3">
          {[
            { date: "Nov 1, 2025", amount: "$99.00", status: "Paid" },
            { date: "Oct 1, 2025", amount: "$99.00", status: "Paid" },
            { date: "Sep 1, 2025", amount: "$99.00", status: "Paid" },
          ].map((invoice, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {invoice.date}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invoice.amount}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                  {invoice.status}
                </span>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {notificationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {notificationStats.total}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Unread
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {notificationStats.unread}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Critical
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {notificationStats.critical_unread}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {notificationStats.today}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              filterUnreadOnly
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Unread Only</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Categories</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="patient">Patient</option>
            <option value="system">System</option>
            <option value="ai_update">AI Updates</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNotifications}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAllRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Mark All Read
          </motion.button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Notifications
          </h3>
        </div>

        {isLoadingNotifications ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !notification.read
                      ? "bg-blue-50/30 dark:bg-blue-900/10"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() =>
                                markNotificationRead(notification.id)
                              }
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-all"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Rules */}
      {alertRules.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Alert Rules
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {alertRules.map((rule) => (
              <div key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {rule.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rule.condition}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {rule.channels.map((channel) => (
                        <span
                          key={channel}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        toggleAlertRule(rule.id, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notification Preferences
        </h3>

        <div className="space-y-4">
          {/* Channel Preferences */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Notification Channels
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("email_enabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive push notifications in app
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.push_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("push_enabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      SMS Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive critical alerts via SMS
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.sms_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("sms_enabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Alert Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 mt-6">
              Alert Types
            </h4>
            <div className="space-y-2">
              {[
                {
                  key: "diagnosis_alerts",
                  label: "Diagnosis Alerts",
                  desc: "Alerts about diagnosis completion",
                },
                {
                  key: "critical_findings",
                  label: "Critical Findings",
                  desc: "Urgent medical findings",
                },
                {
                  key: "ai_updates",
                  label: "AI Updates",
                  desc: "AI model updates",
                },
                {
                  key: "system_maintenance",
                  label: "System Maintenance",
                  desc: "Maintenance notifications",
                },
                {
                  key: "patient_updates",
                  label: "Patient Updates",
                  desc: "Patient record changes",
                },
                {
                  key: "collaboration_requests",
                  label: "Collaboration Requests",
                  desc: "Team collaboration invites",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between p-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {pref.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {pref.desc}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPreferences[pref.key]}
                      onChange={(e) =>
                        handlePreferenceChange(pref.key, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  fetchNotificationPreferences();
                  setHasChanges(false);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateNotificationPreferences(notificationPreferences)
                }
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SimpleLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 sticky top-24">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.isLink && section.path) {
                        navigate(section.path);
                      } else {
                        setActiveSection(section.id);
                      }
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        activeSection === section.id
                          ? section.highlight
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                            : "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                          : section.highlight
                          ? "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-left">{section.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>

            {/* Conditional Content Rendering */}
            {activeSection === "profile" ? (
              renderProfileSection()
            ) : activeSection === "account" ? (
              renderAccountSection()
            ) : activeSection === "notifications" ? (
              renderNotificationsSection()
            ) : activeSection === "security" ? (
              renderSecuritySection()
            ) : activeSection === "integrations" ? (
              renderIntegrationsSection()
            ) : activeSection === "compliance" ? (
              renderComplianceSection()
            ) : activeSection === "data" ? (
              renderDataBackupSection()
            ) : activeSection === "mobile" ? (
              renderMobileDevicesSection()
            ) : activeSection === "billing" ? (
              renderBillingSection()
            ) : (
              <>
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Section Coming Soon
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Settings for{" "}
                          {sections.find((s) => s.id === activeSection)?.label}{" "}
                          will be available soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all">
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore Defaults</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all">
                      Cancel
                    </button>
                    <button
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!hasChanges}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SettingsPage;
