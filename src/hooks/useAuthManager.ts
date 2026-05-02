import { useCallback } from 'react';
import { useFrappe } from '../context/FrappeContext';

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
