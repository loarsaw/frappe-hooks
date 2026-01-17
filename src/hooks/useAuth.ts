import { useState } from 'react';
import { useFrappeContext } from '../context/FrappeContext';

export function useAuth() {
  const { client } = useFrappeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.post('/api/method/login', {
        usr: username,
        pwd: password,
      });
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.post('/api/method/logout');
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, logout, isLoading, error };
}
