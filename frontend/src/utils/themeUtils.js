/**
 * Theme Utilities - Centralized theme management
 * Ensures consistent dark/light mode switching across the application
 */

const THEME_STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

/**
 * Get the current theme from localStorage or system preference
 * Defaults to light mode
 */
export const getCurrentTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? DARK_THEME : LIGHT_THEME;
  } catch (error) {
    console.error('Error getting theme:', error);
    return LIGHT_THEME; // Fallback to light
  }
};

/**
 * Check if dark mode is currently enabled
 */
export const isDarkModeEnabled = () => {
  return getCurrentTheme() === DARK_THEME;
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme) => {
  try {
    const html = document.documentElement;

    if (theme === DARK_THEME) {
      html.classList.add(DARK_CLASS);
      html.setAttribute('data-theme', DARK_THEME);
    } else {
      html.classList.remove(DARK_CLASS);
      html.setAttribute('data-theme', LIGHT_THEME);
    }

    // Update body background for smoother transitions
    if (theme === DARK_THEME) {
      document.body.style.backgroundColor = '#111827'; // gray-900
    } else {
      document.body.style.backgroundColor = '#f9fafb'; // gray-50
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    console.log(
      `🎨 Theme applied: ${theme === DARK_THEME ? '🌙 DARK' : '☀️ LIGHT'}`
    );
  } catch (error) {
    console.error('Error applying theme:', error);
  }
};

/**
 * Toggle between light and dark theme
 */
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

  console.log(
    `🔄 Toggling theme from ${currentTheme === DARK_THEME ? 'DARK' : 'LIGHT'} to ${
      newTheme === DARK_THEME ? 'DARK' : 'LIGHT'
    }`
  );

  applyTheme(newTheme);
  return newTheme;
};

/**
 * Force a specific theme (useful for initialization)
 */
export const setTheme = (theme) => {
  if (theme !== DARK_THEME && theme !== LIGHT_THEME) {
    console.warn(`Invalid theme: ${theme}. Using light mode.`);
    theme = LIGHT_THEME;
  }

  applyTheme(theme);
};

/**
 * Initialize theme on app load
 * This ensures consistent theme application
 */
export const initializeTheme = () => {
  try {
    const theme = getCurrentTheme();
    applyTheme(theme);
    return theme;
  } catch (error) {
    console.error('Error initializing theme:', error);
    applyTheme(LIGHT_THEME); // Fallback to light
    return LIGHT_THEME;
  }
};

/**
 * Reset theme to light mode (useful for debugging or reset functionality)
 */
export const resetThemeToLight = () => {
  console.log('🔄 Resetting theme to light mode');
  applyTheme(LIGHT_THEME);
};

/**
 * Clear theme preference and use system preference
 */
export const clearThemePreference = () => {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? DARK_THEME : LIGHT_THEME;
    applyTheme(theme);
    console.log(`🔄 Theme preference cleared, using system preference: ${theme}`);
    return theme;
  } catch (error) {
    console.error('Error clearing theme preference:', error);
    applyTheme(LIGHT_THEME);
    return LIGHT_THEME;
  }
};

/**
 * Watch for system theme preference changes
 */
export const watchSystemThemePreference = (callback) => {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const newTheme = e.matches ? DARK_THEME : LIGHT_THEME;
      console.log(`🎨 System theme preference changed to: ${newTheme}`);
      callback(newTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  } catch (error) {
    console.error('Error setting up theme watcher:', error);
    return () => {}; // Return no-op function
  }
};

/**
 * Get theme color variables based on current theme
 */
export const getThemeColors = () => {
  const isDark = isDarkModeEnabled();

  return {
    background: isDark ? '#111827' : '#f9fafb', // gray-900 / gray-50
    surface: isDark ? '#1f2937' : '#ffffff', // gray-800 / white
    text: isDark ? '#f3f4f6' : '#111827', // gray-100 / gray-900
    textSecondary: isDark ? '#9ca3af' : '#6b7280', // gray-400 / gray-500
    border: isDark ? '#374151' : '#e5e7eb', // gray-700 / gray-200
  };
};

export default {
  getCurrentTheme,
  isDarkModeEnabled,
  applyTheme,
  toggleTheme,
  setTheme,
  initializeTheme,
  resetThemeToLight,
  clearThemePreference,
  watchSystemThemePreference,
  getThemeColors,
};
