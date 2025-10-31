import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import SimpleLayout from "../components/layouts/SimpleLayout";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { id: "profile", label: "Personal Profile", icon: User },
    {
      id: "account",
      label: "Account & Sign Out",
      icon: LogOut,
      highlight: true,
    },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "display", label: "Display & Accessibility", icon: Palette },
    { id: "security", label: "Security & Authentication", icon: Shield },
    { id: "integrations", label: "Integrations & Connections", icon: LinkIcon },
    {
      id: "workflow",
      label: "Clinical Workflow Preferences",
      icon: Stethoscope,
    },
    { id: "ai", label: "AI Configuration & Tuning", icon: Brain },
    { id: "team", label: "Team & Collaboration", icon: Users },
    { id: "reporting", label: "Reporting & Templates", icon: FileText },
    { id: "compliance", label: "Compliance & Audit", icon: Scale },
    { id: "data", label: "Data & Backup", icon: Database },
    { id: "language", label: "Language & Localization", icon: Globe },
    { id: "mobile", label: "Mobile & Devices", icon: Smartphone },
    { id: "training", label: "Training & Education", icon: GraduationCap },
    { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  ];

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

  const renderAccountSection = () => (
    <div className="space-y-6">
      {/* Account Information Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.avatar || user?.name?.substring(0, 2)?.toUpperCase() || "DR"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {user?.name || "Doctor"}
            </h3>
            <p className="text-gray-600 mb-1">
              {user?.email || "email@example.com"}
            </p>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active Account
              </span>
              {user?.role && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Department</span>
            <span className="font-medium text-gray-900">
              {user?.department || "General"}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Specialization</span>
            <span className="font-medium text-gray-900">
              {user?.specialization || "Medical Professional"}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Account Type</span>
            <span className="font-medium text-gray-900">
              {user?.email?.includes("admin")
                ? "Administrator"
                : user?.email?.includes("researcher")
                ? "Researcher"
                : "Medical Professional"}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">October 2025</span>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign Out
            </h3>
            <p className="text-gray-600 text-sm mb-4">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
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

  return (
    <SimpleLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-card p-4 sticky top-24">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        activeSection === section.id
                          ? section.highlight
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-primary-50 text-primary-700"
                          : section.highlight
                          ? "text-red-700 hover:bg-red-50"
                          : "text-gray-700 hover:bg-gray-50"
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
            className="bg-white rounded-lg shadow-card p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>

            {/* Conditional Content Rendering */}
            {activeSection === "account" ? (
              renderAccountSection()
            ) : (
              <>
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Settings content for {activeSection} section will be
                    implemented here.
                  </p>

                  {/* Example Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Example Setting
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter value..."
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                  <button className="btn-secondary flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore Defaults</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button className="btn-secondary">Cancel</button>
                    <button
                      className="btn-primary flex items-center space-x-2"
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
