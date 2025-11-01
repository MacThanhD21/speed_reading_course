import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by calling /me
          const response = await apiService.getMe();
          if (response.success && response.data) {
            setUser(response.data);
            // Also update localStorage with latest user data
            localStorage.setItem('user', JSON.stringify(response.data));
            console.log('✅ User authenticated from token:', response.data.email);
          } else {
            // Token invalid, clear storage
            console.warn('⚠️ Token validation failed, clearing storage');
            clearAuthData();
          }
        } catch (error) {
          // Check if it's a network error or auth error
          const isNetworkError = error.isNetworkError || error.status === 0 || (error.message && (
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('fetch') ||
            error.message.includes('Network error')
          ));
          
          const isAuthError = error.status === 401 || (error.message && (
            error.message.includes('401') ||
            error.message.includes('Unauthorized') ||
            error.message.includes('token') ||
            error.message.includes('Không có quyền') ||
            error.message.includes('token không hợp lệ')
          ));

          console.log('🔍 Auth check error details:', {
            message: error.message,
            status: error.status,
            isNetworkError,
            isAuthError,
          });

          if (isNetworkError) {
            // Network error - use stored user as fallback (offline mode)
            console.warn('⚠️ Network error during token validation, using stored user:', error.message);
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser && parsedUser.email) {
                setUser(parsedUser);
                console.log('✅ Using cached user data due to network error');
              } else {
                console.error('❌ Invalid cached user data');
                clearAuthData();
              }
            } catch (parseError) {
              console.error('❌ Failed to parse stored user:', parseError);
              clearAuthData();
            }
          } else if (isAuthError) {
            // Auth error - token invalid, clear storage
            console.warn('⚠️ Token invalid (auth error), clearing storage:', error.message);
            clearAuthData();
          } else {
            // Unknown error - be conservative and use stored user
            console.warn('⚠️ Unknown error during token validation, using stored user:', error.message);
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser && parsedUser.email) {
                setUser(parsedUser);
              } else {
                clearAuthData();
              }
            } catch (parseError) {
              console.error('❌ Failed to parse stored user:', parseError);
              clearAuthData();
            }
          }
        }
      } else {
        // No token or stored user - user is not logged in
        console.log('ℹ️ No token or stored user found');
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Đăng ký thất bại' };
    }
  };

  const logout = () => {
    clearAuthData();
    // Don't set loading to false here to avoid race conditions
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

