import React, { createContext, useContext, ReactNode } from 'react';
import { FrappeClient } from '../core/client';
import { CacheManager } from '../core/cache';
import { FrappeClientOptions } from '../core/types';

interface IFrappeInstance {
  client: FrappeClient;
  cache: CacheManager;
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
}

export const FrappeProvider: React.FC<FrappeProviderProps> = ({ 
  children, 
  options, 
  cacheTTL = 300000 
}) => {
  const value: IFrappeInstance = {
    client: new FrappeClient(options),
    cache: new CacheManager(cacheTTL),
  };

  return (
    <FrappeContext.Provider value={value}>
      {children}
    </FrappeContext.Provider>
  );
};
