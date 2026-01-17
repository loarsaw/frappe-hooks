import { useMutation, MutationOptions } from './useMutation';

export interface UseUpdateDocumentOptions<T> extends Omit<MutationOptions<T, { docType: string; documentId: string; data: Partial<T> }>, 'invalidate'> {
  invalidate?: string[] | string | RegExp;
}

export function useUpdateDocument<T = any>(options?: UseUpdateDocumentOptions<T>) {
  return useMutation<T, { docType: string; documentId: string; data: Partial<T> }>(
    async ({ docType, documentId, data }, client) => {
      const url = `/api/resource/${docType}/${documentId}`;
      const result = await client.put<{ data: T }>(url, data);
      return result.data;
    },
    options as any
  );
}
