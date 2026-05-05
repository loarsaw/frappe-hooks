import { useState, useEffect, useMemo } from 'react';
import { useFrappeContext } from '../context/FrappeContext';
import { QueryOptions } from '../types';
import { buildQueryUrl } from '../utils/url-builder';

export function useDocuments<T = any>(doctype: string, options?: QueryOptions) {
  const { client, cache } = useFrappeContext();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(!!doctype);
  const [error, setError] = useState<Error | null>(null);

  // Stable primitive key — useMemo re-computes only when options content changes
  const optionsKey = useMemo(() => JSON.stringify(options), [JSON.stringify(options)]);

  useEffect(() => {
    if (!doctype) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchDocuments = async () => {
      const url = buildQueryUrl(
        `/api/resource/${doctype}`,
        options,
        options?.filters,
        // or filter
        options?.is_or
      );
      const cacheKey = `docs:${doctype}:${optionsKey}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        if (!isCancelled) {
          setData(cached);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await client.get<{ data: T[] }>(url);

        if (!isCancelled) {
          setData(result.data);
          cache.set(cacheKey, result.data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
          setData([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isCancelled = true;
    };
  }, [doctype, optionsKey, client, cache]);

  return { data, isLoading, error };
}
