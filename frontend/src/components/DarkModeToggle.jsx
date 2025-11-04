import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log(
      `🎨 Dark Mode Toggle clicked - Current: ${isDarkMode ? "DARK" : "LIGHT"}`
    );
    toggleTheme();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className="relative p-2.5 rounded-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon - visible in light mode */}
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 0 : 1,
            opacity: isDarkMode ? 0 : 1,
            rotate: isDarkMode ? 90 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-yellow-500" />
        </motion.div>

        {/* Moon Icon - visible in dark mode */}
        <motion.div
          initial={false}
          animate={{
            scale: isDarkMode ? 1 : 0,
            opacity: isDarkMode ? 1 : 0,
            rotate: isDarkMode ? 0 : -90,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-blue-400" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default DarkModeToggle;
