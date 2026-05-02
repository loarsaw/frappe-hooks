import { useState } from 'react';
import { useFrappeContext } from '../context/FrappeContext';
import { getUtils } from '../utils';
import { UploadFileOptions, UploadFileResponse } from '../types';

export interface UseUploadFileOptions {
  onSuccess?: (data: UploadFileResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export function useUploadFile(options?: UseUploadFileOptions) {
  const { client } = useFrappeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<UploadFileResponse | null>(null);

  const upload = async (
    file: File,
    uploadOptions?: UploadFileOptions
  ): Promise<UploadFileResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const utils = getUtils(client);
      const result = await utils.uploadFile(file, uploadOptions);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { upload, isLoading, error, data };
}
