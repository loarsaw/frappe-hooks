// src/hooks/__tests__/useDeleteDocument.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useDeleteDocument } from '../useDeleteDocument';
import { useFrappe } from '../../context/FrappeContext';

vi.mock('../../context/FrappeContext');

describe('useDeleteDocument', () => {
  const mockClient = {
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFrappe as Mock).mockReturnValue({ client: mockClient });
  });

  it('should call client.delete with correct URL', async () => {
    mockClient.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument());

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(mockClient.delete).toHaveBeenCalledWith('/api/resource/User/User 1');
  });

  it('should return void on success', async () => {
    mockClient.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument());

    let returned: any = 'not-void';
    await act(async () => {
      returned = await result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(returned).toBeUndefined();
  });

  it('should call onSuccess after successful delete', async () => {
    mockClient.delete.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useDeleteDocument({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(onSuccess).toHaveBeenCalledWith(undefined);
  });

  it('should call onError when delete fails', async () => {
    const mockError = new Error('Document not found');
    mockClient.delete.mockRejectedValue(mockError);
    const onError = vi.fn();

    const { result } = renderHook(() => useDeleteDocument({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', documentId: 'User 1' });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should set error state when delete fails', async () => {
    const mockError = new Error('Permission denied');
    mockClient.delete.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDeleteDocument());

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', documentId: 'User 1' });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should set isLoading during mutation', async () => {
    let resolveDelete!: (value: any) => void;
    mockClient.delete.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDelete = resolve;
        })
    );

    const { result } = renderHook(() => useDeleteDocument());

    act(() => {
      result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveDelete(undefined);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should build URL from docType and documentId correctly', async () => {
    mockClient.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument());

    await act(async () => {
      await result.current.mutate({
        docType: 'Sales Invoice',
        documentId: 'SINV-00001',
      });
    });

    expect(mockClient.delete).toHaveBeenCalledWith('/api/resource/Sales Invoice/SINV-00001');
  });

  it('should rethrow error from mutate', async () => {
    const mockError = new Error('Failed');
    mockClient.delete.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDeleteDocument());

    await act(async () => {
      await expect(
        result.current.mutate({ docType: 'User', documentId: 'User 1' })
      ).rejects.toThrow('Failed');
    });
  });

  it('should only call client.delete, not put or post', async () => {
    const fullMockClient = {
      delete: vi.fn().mockResolvedValue(undefined),
      put: vi.fn(),
      post: vi.fn(),
      get: vi.fn(),
    };
    (useFrappe as Mock).mockReturnValue({ client: fullMockClient });

    const { result } = renderHook(() => useDeleteDocument());

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(fullMockClient.delete).toHaveBeenCalledTimes(1);
    expect(fullMockClient.put).not.toHaveBeenCalled();
    expect(fullMockClient.post).not.toHaveBeenCalled();
  });

  it('should accept custom invalidate option', async () => {
    mockClient.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDocument({ invalidate: /^docs:User/ }));

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1' });
    });

    expect(result.current.error).toBeNull();
  });
});
