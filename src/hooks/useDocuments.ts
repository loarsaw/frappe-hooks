import { useState, useEffect } from 'react';
import { useFrappeContext } from '../context/FrappeContext';
import { QueryOptions } from '../types';
import { buildQueryUrl } from '../utils/url-builder';

export function useDocuments<T = any>(doctype: string, options?: QueryOptions) {
  const { client, cache } = useFrappeContext();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      const url = buildQueryUrl(`/api/resource/${doctype}`, options, options?.filters);
      const cacheKey = `docs:${doctype}:${JSON.stringify(options)}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await client.get<{ data: T[] }>(url);
        setData(result.data);
        cache.set(cacheKey, result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (doctype) {
      fetchDocuments();
    }
  }, [doctype, JSON.stringify(options), client, cache]);

  return { data, isLoading, error };
}
