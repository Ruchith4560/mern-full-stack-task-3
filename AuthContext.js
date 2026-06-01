// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Provider component — wraps the whole app in App.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session on mount
  const [error, setError]     = useState(null);

  // On first load: check if user already has a valid cookie session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authService.getMe();
        setUser(data.data.user);
      } catch {
        setUser(null); // no valid session
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // ── Signup ──────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    setError(null);
    const { data } = await authService.signup(formData);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // ── Login ───────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    setError(null);
    const { data } = await authService.login(formData);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,           // null = not logged in, object = logged in
    loading,        // true while checking session (prevent flash of login page)
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom hook — cleaner than importing useContext everywhere
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
