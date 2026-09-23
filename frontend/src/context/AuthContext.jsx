import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  getMeApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '../utils/api';

const AuthContext = createContext(null);

const USER_STORAGE_KEY = 'pulseops_user_profile';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(() => {
    const hasToken = Boolean(getAuthToken());
    const hasCachedUser = Boolean(localStorage.getItem(USER_STORAGE_KEY));
    // If no token exists, user is definitely logged out -> false immediately
    if (!hasToken) return false;
    // If both token and cached user exist, authenticated state is ready immediately -> false
    if (hasToken && hasCachedUser) return false;
    // Only wait if token exists but cached user profile is missing
    return true;
  });

  // Verify stored token on app load
  useEffect(() => {
    async function verifyUserSession() {
      const existingToken = getAuthToken();
      if (!existingToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getMeApi();
        if (userData) {
          setUser(userData);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
      } catch (error) {
        // Only invalidate if explicit auth failure
        const isAuthError =
          error.message?.includes('401') ||
          error.message?.includes('403') ||
          error.message?.includes('jwt') ||
          error.message?.includes('token') ||
          error.message?.includes('Unauthorized');

        if (isAuthError) {
          removeAuthToken();
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    verifyUserSession();
  }, []);

  // Register
  const register = useCallback(async (name, email, password) => {
    const res = await registerApi(name, email, password);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  }, []);

  // Logout
  const logout = useCallback(() => {
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
