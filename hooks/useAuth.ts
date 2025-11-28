/**
 * Authentication Hook
 * Handles user authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { sessionService } from '../services/storageService';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionService.getAuthToken();
      
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token invalid, clear it
          sessionService.clearTokens();
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        sessionService.clearTokens();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Login failed',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred',
      }));
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.register({ name, email, password });
      
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    await authApi.logout();
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    const response = await authApi.getCurrentUser();
    if (response.success && response.data) {
      setState(prev => ({ ...prev, user: response.data! }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };
};

export default useAuth;
