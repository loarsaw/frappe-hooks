import { useMutation, MutationOptions } from './useMutation';

export interface UseDeleteDocumentOptions extends Omit<
  MutationOptions<void, { docType: string; documentId: string }>,
  'invalidate'
> {
  invalidate?: string[] | string | RegExp;
}

export function useDeleteDocument(options?: UseDeleteDocumentOptions) {
  return useMutation<void, { docType: string; documentId: string }>(
    async ({ docType, documentId }, client) => {
      await client.delete(`/api/resource/${docType}/${documentId}`);
    },
    options as any
  );
}
