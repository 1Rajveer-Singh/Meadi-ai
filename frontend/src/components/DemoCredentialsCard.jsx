import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle, X, Sparkles } from "lucide-react";

const DemoCredentialsCard = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState(null);

  const demoAccounts = [
    {
      role: "👨‍⚕️ Admin",
      name: "Dr. Jennifer Martinez",
      email: "admin@example.com",
      password: "admin123",
      color: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      role: "👨‍⚕️ Doctor",
      name: "Dr. Michael Chen",
      email: "doctor@example.com",
      password: "doctor123",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      role: "🔬 Researcher",
      name: "Dr. Sarah Kim",
      email: "researcher@example.com",
      password: "research123",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Demo Login Credentials
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose any account to explore the platform
            </p>
          </div>

          {/* Accounts */}
          <div className="space-y-4">
            {demoAccounts.map((account, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${account.bgColor} ${account.borderColor} border-2 rounded-xl p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {account.role}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.name}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${account.color} text-white text-xs font-semibold`}
                  >
                    Demo
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Email */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between transition-colors duration-300">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </p>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {account.email}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(account.email, `email-${index}`)
                      }
                      className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedField === `email-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between transition-colors duration-300">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Password</p>
                      <p className="font-mono text-sm text-gray-900">
                        {account.password}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(account.password, `password-${index}`)
                      }
                      className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {copiedField === `password-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              🔒 <strong>Security Note:</strong> These are demo accounts for
              testing purposes only. All data is sandboxed and HIPAA compliant.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoCredentialsCard;
