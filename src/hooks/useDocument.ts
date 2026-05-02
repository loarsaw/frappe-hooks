import { useState, useEffect } from 'react';
import { useFrappeContext } from '../context/FrappeContext';

// expand_links
// Expand all link fields by sending a GET request to /api/resource/:doctype/:name?expand_links=True.
export function useDocument<T = any>(doctype: string, name: string, expand_links: boolean = false) {
  const { client, cache } = useFrappeContext();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!(doctype && name));

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      const cacheKey = `doc:${doctype}:${name}?expand_links=${expand_links}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await client.get<{ data: T }>(`/api/resource/${doctype}/${name}`);
        setData(result.data);
        cache.set(cacheKey, result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!doctype || !name) {
      setIsLoading(false);
      return;
    }

    fetchDocument();
  }, [doctype, name, client, cache]);

  return { data, isLoading, error };
}
