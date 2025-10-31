import { useState } from 'react';
import { motion } from 'framer-motion';
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
  RotateCcw
} from 'lucide-react';
import SimpleLayout from '../components/layouts/SimpleLayout';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  const sections = [
    { id: 'profile', label: 'Personal Profile', icon: User },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'display', label: 'Display & Accessibility', icon: Palette },
    { id: 'security', label: 'Security & Authentication', icon: Shield },
    { id: 'integrations', label: 'Integrations & Connections', icon: LinkIcon },
    { id: 'workflow', label: 'Clinical Workflow Preferences', icon: Stethoscope },
    { id: 'ai', label: 'AI Configuration & Tuning', icon: Brain },
    { id: 'team', label: 'Team & Collaboration', icon: Users },
    { id: 'reporting', label: 'Reporting & Templates', icon: FileText },
    { id: 'compliance', label: 'Compliance & Audit', icon: Scale },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'language', label: 'Language & Localization', icon: Globe },
    { id: 'mobile', label: 'Mobile & Devices', icon: Smartphone },
    { id: 'training', label: 'Training & Education', icon: GraduationCap },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  ];

  return (
    <SimpleLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
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
                      ${activeSection === section.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
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
              {sections.find(s => s.id === activeSection)?.label}
            </h2>

            <div className="space-y-6">
              <p className="text-gray-600">
                Settings content for {activeSection} section will be implemented here.
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
          </motion.div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SettingsPage;
