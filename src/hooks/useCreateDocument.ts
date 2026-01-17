import { useMutation, MutationOptions } from './useMutation';

export interface UseCreateDocumentOptions<T> extends Omit<
  MutationOptions<T, { docType: string; data: Partial<T> }>,
  'invalidate'
> {
  invalidate?: string[] | string | RegExp;
}

export function useCreateDocument<T = any>(options?: UseCreateDocumentOptions<T>) {
  return useMutation<T, { docType: string; data: Partial<T> }>(
    async ({ docType, data }, client) => {
      const url = `/api/resource/${docType}`;
      const result = await client.post<{ data: T }>(url, data);
      return result.data;
    },
    {
      ...options,
      invalidate: options?.invalidate || /^docs:/,
    } as any
  );
}
