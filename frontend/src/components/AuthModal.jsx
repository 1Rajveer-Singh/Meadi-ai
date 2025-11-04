import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Heart,
} from "lucide-react";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Demo credentials
  const demoAccounts = [
    {
      email: "admin@example.com",
      password: "admin123",
      label: "Admin",
      icon: "👨‍⚕️",
    },
    {
      email: "doctor@example.com",
      password: "doctor123",
      label: "Doctor",
      icon: "👨‍⚕️",
    },
    {
      email: "researcher@example.com",
      password: "research123",
      label: "Researcher",
      icon: "🔬",
    },
  ];

  const fillDemoCredentials = (email, password) => {
    setFormData({ ...formData, email, password });
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (mode !== "forgot") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (
        mode === "register" &&
        formData.password !== formData.confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
        let response;

        if (mode === "login") {
          response = await login(formData.email, formData.password);
        } else if (mode === "register") {
          response = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          });
        } else if (mode === "forgot") {
          // For forgot password, we'll just show a success message for now
          setSubmitStatus({
            success: true,
            message:
              "If an account exists with this email, password reset instructions have been sent.",
          });
          setIsSubmitting(false);
          return;
        }

        if (response.success) {
          setSubmitStatus({
            success: true,
            message:
              response.message ||
              `${mode === "login" ? "Login" : "Registration"} successful!`,
          });

          // Close modal and redirect after a short delay
          setTimeout(() => {
            onClose();
            navigate(response.redirect);
          }, 1500);
        } else {
          setSubmitStatus({
            success: false,
            message: response.error,
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        setSubmitStatus({
          success: false,
          message: error.message || "An unexpected error occurred",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md"
        >
          <div className="glass-card p-8 relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors duration-300">
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-600/20 dark:via-purple-600/20 dark:to-pink-600/20"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>

            {/* Content */}
            <div className="relative z-10">
              {/* Logo and Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl mb-4 shadow-lg"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                  {mode === "login" && "Welcome Back"}
                  {mode === "register" && "Create Account"}
                  {mode === "forgot" && "Reset Password"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {mode === "login" && "Sign in to access your dashboard"}
                  {mode === "register" && "Join us to revolutionize healthcare"}
                  {mode === "forgot" && "We'll send you a reset link"}
                </p>
              </motion.div>

              {/* Demo Credentials Section */}
              {mode === "login" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 transition-colors duration-300"
                >
                  <div className="flex items-start mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 transition-colors duration-300">
                        Try Demo Accounts (Click to Fill)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {demoAccounts.map((account, index) => (
                          <motion.button
                            key={account.email}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              fillDemoCredentials(
                                account.email,
                                account.password
                              )
                            }
                            className="bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 p-2.5 rounded-lg text-left transition-all shadow-sm hover:shadow-md group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{account.icon}</span>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {account.label}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {account.email}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status message */}
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg mb-4 flex items-center ${
                    submitStatus.success
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field (Register only) */}
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`glass-input pl-10 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-300 ${
                          errors.name
                            ? "border-alert-500 dark:border-alert-400"
                            : ""
                        }`}
                        placeholder="Dr. Jennifer Martinez"
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-alert-600 mt-1 flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mode === "register" ? 0.2 : 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`glass-input pl-10 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-300 ${
                        errors.email
                          ? "border-alert-500 dark:border-alert-400"
                          : ""
                      }`}
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-alert-600 mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password field (not for forgot) */}
                {mode !== "forgot" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mode === "register" ? 0.3 : 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`glass-input pl-10 pr-10 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-300 ${
                          errors.password
                            ? "border-alert-500 dark:border-alert-400"
                            : ""
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-alert-600 mt-1 flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Confirm Password field (Register only) */}
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`glass-input pl-10 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors duration-300 ${
                          errors.confirmPassword
                            ? "border-alert-500 dark:border-alert-400"
                            : ""
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-alert-600 mt-1 flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Forgot password link (Login only) */}
                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`glass-button glass-button-primary w-full justify-center font-bold text-lg group relative overflow-hidden ${
                    isSubmitting ? "opacity-80" : ""
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center"
                      >
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>
                          {mode === "login" && "Signing In..."}
                          {mode === "register" && "Creating Account..."}
                          {mode === "forgot" && "Sending..."}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center"
                      >
                        <span>
                          {mode === "login" && "Sign In"}
                          {mode === "register" && "Create Account"}
                          {mode === "forgot" && "Send Reset Link"}
                        </span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ripple animation on submit */}
                  {isSubmitting && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20 rounded-full"
                      style={{ originX: 0.5, originY: 0.5 }}
                    />
                  )}
                </motion.button>

                {/* Mode switch */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  {mode === "login" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors duration-300"
                      >
                        Sign up
                      </button>
                    </p>
                  )}
                  {mode === "register" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors duration-300"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                  {mode === "forgot" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors duration-300"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>

                {/* Security badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 pt-4 transition-colors duration-300"
                >
                  <Shield className="w-4 h-4 text-health-600 dark:text-health-400 transition-colors duration-300" />
                  <span>HIPAA Compliant • End-to-End Encrypted</span>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
