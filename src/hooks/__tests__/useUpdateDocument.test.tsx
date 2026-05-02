// src/hooks/__tests__/useUpdateDocument.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useUpdateDocument } from '../useUpdateDocument';
import { useFrappe } from '../../context/FrappeContext';

vi.mock('../../context/FrappeContext');

describe('useUpdateDocument', () => {
  const mockClient = {
    put: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFrappe as Mock).mockReturnValue({ client: mockClient });
  });

  it('should call client.put with correct URL and data', async () => {
    const mockData = { name: 'User 1', email: 'updated@example.com' };
    mockClient.put.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useUpdateDocument());

    await act(async () => {
      await result.current.mutate({
        docType: 'User',
        documentId: 'User 1',
        data: { email: 'updated@example.com' },
      });
    });

    expect(mockClient.put).toHaveBeenCalledWith('/api/resource/User/User 1', {
      email: 'updated@example.com',
    });
  });

  it('should return the updated document data', async () => {
    const mockData = { name: 'User 1', email: 'updated@example.com' };
    mockClient.put.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useUpdateDocument());

    let returned: any;
    await act(async () => {
      returned = await result.current.mutate({
        docType: 'User',
        documentId: 'User 1',
        data: {},
      });
    });

    expect(returned).toEqual(mockData);
  });

  it('should call onSuccess with updated document', async () => {
    const mockData = { name: 'User 1', email: 'updated@example.com' };
    mockClient.put.mockResolvedValue({ data: mockData });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useUpdateDocument({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should call onError when put fails', async () => {
    const mockError = new Error('Not found');
    mockClient.put.mockRejectedValue(mockError);
    const onError = vi.fn();

    const { result } = renderHook(() => useUpdateDocument({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should set error state when put fails', async () => {
    const mockError = new Error('Server error');
    mockClient.put.mockRejectedValue(mockError);

    const { result } = renderHook(() => useUpdateDocument());

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should set isLoading during mutation', async () => {
    let resolvePut!: (value: any) => void;
    mockClient.put.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePut = resolve;
        })
    );

    const { result } = renderHook(() => useUpdateDocument());

    act(() => {
      result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePut({ data: { name: 'User 1' } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should build URL from docType and documentId correctly', async () => {
    mockClient.put.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useUpdateDocument());

    await act(async () => {
      await result.current.mutate({
        docType: 'Sales Invoice',
        documentId: 'SINV-00001',
        data: { status: 'Paid' },
      });
    });

    expect(mockClient.put).toHaveBeenCalledWith('/api/resource/Sales Invoice/SINV-00001', {
      status: 'Paid',
    });
  });

  it('should rethrow error from mutate', async () => {
    const mockError = new Error('Failed');
    mockClient.put.mockRejectedValue(mockError);

    const { result } = renderHook(() => useUpdateDocument());

    await act(async () => {
      await expect(
        result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} })
      ).rejects.toThrow('Failed');
    });
  });

  it('should accept custom invalidate option', async () => {
    mockClient.put.mockResolvedValue({ data: {} });

    const { result } = renderHook(() =>
      useUpdateDocument({ invalidate: ['docs:User', /^doc:User/] as any })
    );

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
    });

    expect(result.current.error).toBeNull();
  });

  it('should only call client.put, not post or delete', async () => {
    const fullMockClient = {
      put: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
    };
    (useFrappe as Mock).mockReturnValue({ client: fullMockClient });

    const { result } = renderHook(() => useUpdateDocument());

    await act(async () => {
      await result.current.mutate({ docType: 'User', documentId: 'User 1', data: {} });
    });

    expect(fullMockClient.put).toHaveBeenCalledTimes(1);
    expect(fullMockClient.post).not.toHaveBeenCalled();
    expect(fullMockClient.delete).not.toHaveBeenCalled();
  });
});
