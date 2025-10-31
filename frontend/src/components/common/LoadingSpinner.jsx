// Ultra-Advanced Loading Spinner Component
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Activity, Heart, Brain, Microscope } from 'lucide-react';

/**
 * LoadingSpinner - Ultra-advanced loading component
 * Supports multiple styles, sizes, and overlay modes
 */

const LoadingSpinner = ({
  size = 'md',
  variant = 'default',
  overlay = false,
  fullScreen = false,
  message = null,
  icon: CustomIcon = null,
  className = '',
}) => {
  // Size configurations
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Message text sizes
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Spinner variants
  const renderSpinner = () => {
    const sizeClass = sizes[size] || sizes.md;
    const IconComponent = CustomIcon || Loader2;

    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`${sizeClass} rounded-full bg-blue-600`}
          />
        );

      case 'dots':
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: ['0%', '-50%', '0%'],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="w-3 h-3 rounded-full bg-blue-600"
              />
            ))}
          </div>
        );

      case 'medical':
        return (
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className={sizeClass}
            >
              <Heart className="w-full h-full text-red-500 fill-red-500" />
            </motion.div>
          </div>
        );

      case 'brain':
        return (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={sizeClass}
          >
            <Brain className="w-full h-full text-purple-600" />
          </motion.div>
        );

      case 'activity':
        return (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className={sizeClass}
          >
            <Activity className="w-full h-full text-green-600" />
          </motion.div>
        );

      case 'microscope':
        return (
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={sizeClass}
          >
            <Microscope className="w-full h-full text-blue-600" />
          </motion.div>
        );

      case 'spinner':
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={sizeClass}
          >
            <IconComponent className="w-full h-full text-blue-600" />
          </motion.div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {renderSpinner()}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${textSizes[size]} text-gray-600 font-medium text-center`}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        {content}
      </motion.div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg"
      >
        {content}
      </motion.div>
    );
  }

  // Inline loading
  return content;
};

// Progress bar loader
export const ProgressLoader = ({ progress = 0, message = null, showPercentage = true }) => {
  return (
    <div className="w-full space-y-2">
      {message && (
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      )}
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 -top-6 text-xs font-semibold text-blue-600"
          >
            {Math.round(progress)}%
          </motion.span>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for text
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Circular progress
export const CircularProgress = ({ progress = 0, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5 }}
          className="text-blue-600"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold text-gray-700">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

// Spinner with custom colors
export const ColoredSpinner = ({ colors = ['#3B82F6', '#8B5CF6', '#EC4899'], size = 40 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid transparent`,
            borderTopColor: color,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1 + i * 0.3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
