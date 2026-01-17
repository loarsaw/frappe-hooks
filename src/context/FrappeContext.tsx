// src/context/FrappeContext.tsx
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { FrappeClient } from '../core/client';
import { CacheManager } from '../core/cache';
import { FrappeClientOptions } from '../core/types';

interface IFrappeInstance {
  client: FrappeClient;
  cache: CacheManager;
  updateCredentials: (credentials: Partial<FrappeClientOptions>) => void;
  clearCredentials: () => void;
  isAuthenticated: boolean;
}

const FrappeContext = createContext<IFrappeInstance | null>(null);

export const useFrappe = () => {
  const context = useContext(FrappeContext);
  if (!context) {
    throw new Error('useFrappe must be used within a FrappeProvider');
  }
  return context;
};

// Alias for compatibility
export const useFrappeContext = useFrappe;

interface FrappeProviderProps {
  children: ReactNode;
  options: FrappeClientOptions;
  cacheTTL?: number;
  enableDynamicAuth?: boolean; // New feature flag
}

export const FrappeProvider: React.FC<FrappeProviderProps> = ({
  children,
  options: initialOptions,
  cacheTTL = 300000,
  enableDynamicAuth = false,
}) => {
  const [client, setClient] = useState(() => new FrappeClient(initialOptions));
  const [cache] = useState(() => new CacheManager(cacheTTL));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(initialOptions.token || (initialOptions.username && initialOptions.password))
  );

  const updateCredentials = useCallback(
    (credentials: Partial<FrappeClientOptions>) => {
      if (!enableDynamicAuth) {
        console.warn(
          'Dynamic authentication is not enabled. Set enableDynamicAuth={true} on FrappeProvider'
        );
        return;
      }

      const newOptions = {
        ...initialOptions,
        ...credentials,
      };

      setClient(new FrappeClient(newOptions));
      setIsAuthenticated(!!(newOptions.token || (newOptions.username && newOptions.password)));

      // Clear cache when credentials change
      cache.clear();
    },
    [initialOptions, enableDynamicAuth, cache]
  );

  const clearCredentials = useCallback(() => {
    if (!enableDynamicAuth) {
      console.warn(
        'Dynamic authentication is not enabled. Set enableDynamicAuth={true} on FrappeProvider'
      );
      return;
    }

    setClient(new FrappeClient({ url: initialOptions.url }));
    setIsAuthenticated(false);
    cache.clear();
  }, [initialOptions.url, enableDynamicAuth, cache]);

  const value: IFrappeInstance = {
    client,
    cache,
    updateCredentials,
    clearCredentials,
    isAuthenticated,
  };

  return <FrappeContext.Provider value={value}>{children}</FrappeContext.Provider>;
};

// New hook for managing authentication
export function useAuthManager() {
  const { updateCredentials, clearCredentials, isAuthenticated } = useFrappe();

  const loginWithPassword = useCallback(
    async (username: string, password: string) => {
      updateCredentials({ username, password, useToken: false });
    },
    [updateCredentials]
  );

  const loginWithToken = useCallback(
    (apiKey: string, apiSecret: string) => {
      updateCredentials({ token: `${apiKey}:${apiSecret}`, useToken: true });
    },
    [updateCredentials]
  );

  const logout = useCallback(() => {
    clearCredentials();
  }, [clearCredentials]);

  return {
    loginWithPassword,
    loginWithToken,
    logout,
    isAuthenticated,
  };
}
