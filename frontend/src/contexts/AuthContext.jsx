import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // For now, just use stored user data since we don't have /auth/me endpoint yet
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Auth validation error:', error);
          clearAuth();
        }
      }
      // Remove auto-login bypass - require proper authentication
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        // Fetch user data with new token
        const userResponse = await apiClient.get('/auth/me');
        if (userResponse.success) {
          setUser(userResponse.user);
          localStorage.setItem('user', JSON.stringify(userResponse.user));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    }
  };

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  };

  const login = async (email, password) => {
    try {
      // Demo credentials - Enhanced multi-agent AI system users
      const demoCredentials = {
        'admin@example.com': {
          password: 'admin123',
          user: {
            id: '1',
            name: 'Dr. Jennifer Martinez',
            email: 'admin@example.com',
            role: 'radiologist',
            department: 'AI Medical Diagnostics',
            avatar: 'JM',
            permissions: ['read_patients', 'write_reports', 'analyze_images', 'admin_access'],
            specialization: 'AI-Enhanced Radiology'
          }
        },
        'doctor@example.com': {
          password: 'doctor123',
          user: {
            id: '2',
            name: 'Dr. Michael Chen',
            email: 'doctor@example.com',
            role: 'physician',
            department: 'Internal Medicine',
            avatar: 'MC',
            permissions: ['read_patients', 'write_reports', 'drug_interaction_check'],
            specialization: 'AI-Assisted Clinical Decision Making'
          }
        },
        'researcher@example.com': {
          password: 'research123',
          user: {
            id: '3',
            name: 'Dr. Sarah Kim',
            email: 'researcher@example.com',
            role: 'researcher',
            department: 'Clinical Research',
            avatar: 'SK',
            permissions: ['read_patients', 'clinical_trials', 'research_access'],
            specialization: 'AI Medical Research & Clinical Trials'
          }
        }
      };

      // Check demo credentials first
      const demoUser = demoCredentials[email];
      if (demoUser && demoUser.password === password) {
        setUser(demoUser.user);
        localStorage.setItem('user', JSON.stringify(demoUser.user));
        localStorage.setItem('authToken', `demo-token-${demoUser.user.id}`);
        localStorage.setItem('refreshToken', `demo-refresh-${demoUser.user.id}`);
        
        return { 
          success: true, 
          redirect: '/dashboard',
          message: `Welcome back, ${demoUser.user.name}! Multi-Agent AI System Ready.` 
        };
      }

      // Try backend authentication
      const response = await apiClient.post('/api/auth/login', { email, password });
      
      // Handle the actual backend response format
      if (response.access_token) {
        const user = {
          id: response.user_id,
          name: email.split('@')[0], // Extract name from email for now
          email: email,
          role: 'user',
          department: 'General',
          avatar: email.substring(0, 2).toUpperCase(),
          permissions: ['read_patients', 'write_reports'],
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('refreshToken', response.access_token); // Using same token for now
        
        return { 
          success: true, 
          redirect: '/dashboard',
          message: `Welcome back, ${user.name}!` 
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials. Try demo accounts: admin@example.com (admin123), doctor@example.com (doctor123), or researcher@example.com (research123)'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Invalid credentials. Try demo accounts: admin@example.com (admin123), doctor@example.com (doctor123), or researcher@example.com (research123)'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.name,
        role: 'user'
      });
      
      // Handle the actual backend response format
      if (response.access_token) {
        const user = {
          id: response.user_id,
          name: userData.name,
          email: userData.email,
          role: 'user',
          department: 'General',
          avatar: userData.name.substring(0, 2).toUpperCase(),
          permissions: ['read_patients', 'write_reports'],
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('refreshToken', response.access_token); // Using same token for now
        
        return { 
          success: true, 
          redirect: '/dashboard',
          message: `Welcome to AgenticAI HealthGuard, ${user.name}!` 
        };
      } else {
        return { 
          success: false, 
          error: 'Registration failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Registration failed. Network error.'
      };
    }
  };

  const logout = async () => {
    try {
      // Attempt to notify backend about logout
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data regardless of API response
      clearAuth();
      toast.success('You have been logged out successfully');
      return { redirect: '/' };
    }
  };

  const updateUser = async (userData) => {
    try {
      // In a real app, you would call an API endpoint to update user data
      // const response = await apiClient.put('/auth/user', userData);
      
      // For now, just update locally
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Emit custom event for real-time navbar updates
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: updatedUser 
      }));
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update profile');
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.permissions?.includes('all')) return true;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    hasPermission,
    refreshAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
