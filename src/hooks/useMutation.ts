import { useState } from 'react';
import { useFrappe } from '../context/FrappeContext';
import { MutationOptions } from '../types';
import { FrappeClient } from '../core/client';

export type { MutationOptions };

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables, client: FrappeClient) => Promise<TData>,
  options?: MutationOptions<TData, TVariables>
) {
  const { client } = useFrappe();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await mutationFn(variables, client);
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}
