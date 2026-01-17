// src/hooks/useAuth.ts
import { useState } from 'react';
import { useFrappeContext, useAuthManager } from '../context/FrappeContext';

export interface LoginCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
}

export function useAuth() {
  const { client, isAuthenticated } = useFrappeContext();
  const { loginWithPassword, loginWithToken, logout: logoutManager } = useAuthManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Session-based login (calls Frappe login API)
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.post('/api/method/login', {
        usr: username,
        pwd: password,
      });

      // Update context with credentials
      await loginWithPassword(username, password);

      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Token-based login (no API call, just sets credentials)
  const loginWithAPIToken = async (apiKey: string, apiSecret: string) => {
    setIsLoading(true);
    setError(null);

    try {
      loginWithToken(apiKey, apiSecret);

      // Optional: Verify token by making a test API call
      await client.get('/api/method/frappe.auth.get_logged_user');

      return { success: true };
    } catch (err) {
      setError(err as Error);
      logoutManager(); // Clear invalid credentials
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic login that accepts both methods
  const dynamicLogin = async (credentials: LoginCredentials) => {
    if (credentials.apiKey && credentials.apiSecret) {
      return loginWithAPIToken(credentials.apiKey, credentials.apiSecret);
    } else if (credentials.username && credentials.password) {
      return login(credentials.username, credentials.password);
    } else {
      throw new Error('Please provide either (username & password) or (apiKey & apiSecret)');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to call logout API (may fail if using token auth)
      try {
        await client.post('/api/method/logout');
      } catch {
        // Ignore logout API errors
      }

      // Clear credentials from context
      logoutManager();

      return { success: true };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const result = await client.get('/api/method/frappe.auth.get_logged_user');
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    login,
    loginWithAPIToken,
    dynamicLogin,
    logout,
    getCurrentUser,
    isLoading,
    error,
    isAuthenticated,
  };
}
