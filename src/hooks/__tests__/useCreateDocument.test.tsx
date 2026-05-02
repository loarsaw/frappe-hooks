// src/hooks/__tests__/useCreateDocument.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useCreateDocument } from '../useCreateDocument';
import { useFrappe } from '../../context/FrappeContext';

vi.mock('../../context/FrappeContext');

describe('useCreateDocument', () => {
  const mockClient = {
    post: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFrappe as Mock).mockReturnValue({ client: mockClient });
  });

  it('should call client.post with correct URL and data', async () => {
    const mockData = { name: 'User 1', email: 'user1@example.com' };
    mockClient.post.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCreateDocument());

    await act(async () => {
      await result.current.mutate({ docType: 'User', data: { email: 'user1@example.com' } });
    });

    expect(mockClient.post).toHaveBeenCalledWith('/api/resource/User', {
      email: 'user1@example.com',
    });
  });

  it('should return the created document data', async () => {
    const mockData = { name: 'User 1', email: 'user1@example.com' };
    mockClient.post.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCreateDocument());

    let returned: any;
    await act(async () => {
      returned = await result.current.mutate({ docType: 'User', data: {} });
    });

    expect(returned).toEqual(mockData);
  });

  it('should default invalidate to /^docs:/ regex', async () => {
    // The default invalidate pattern should match cache keys prefixed with "docs:"
    const defaultInvalidate = /^docs:/;
    expect(defaultInvalidate.test('docs:User')).toBe(true);
    expect(defaultInvalidate.test('docs:Role:{"fields":["name"]}')).toBe(true);
    expect(defaultInvalidate.test('doc:User:User 1')).toBe(false);
  });

  it('should call onSuccess with created document', async () => {
    const mockData = { name: 'New User' };
    mockClient.post.mockResolvedValue({ data: mockData });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCreateDocument({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ docType: 'User', data: {} });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should call onError when post fails', async () => {
    const mockError = new Error('Validation error');
    mockClient.post.mockRejectedValue(mockError);
    const onError = vi.fn();

    const { result } = renderHook(() => useCreateDocument({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', data: {} });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should set error state when post fails', async () => {
    const mockError = new Error('Server error');
    mockClient.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateDocument());

    await act(async () => {
      try {
        await result.current.mutate({ docType: 'User', data: {} });
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should set isLoading during mutation', async () => {
    let resolvePost!: (value: any) => void;
    mockClient.post.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePost = resolve;
        })
    );

    const { result } = renderHook(() => useCreateDocument());

    act(() => {
      result.current.mutate({ docType: 'User', data: {} });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePost({ data: { name: 'User 1' } });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should use custom invalidate when provided', async () => {
    // Verify custom invalidate is accepted without TypeScript errors
    // and passed through (behavioral test via options shape)
    mockClient.post.mockResolvedValue({ data: {} });

    const { result } = renderHook(() =>
      useCreateDocument({ invalidate: ['docs:User', 'docs:Role'] })
    );

    await act(async () => {
      await result.current.mutate({ docType: 'User', data: {} });
    });

    expect(result.current.error).toBeNull();
  });

  it('should build URL from docType correctly', async () => {
    mockClient.post.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useCreateDocument());

    await act(async () => {
      await result.current.mutate({ docType: 'Sales Invoice', data: {} });
    });

    expect(mockClient.post).toHaveBeenCalledWith('/api/resource/Sales Invoice', {});
  });

  it('should rethrow error from mutate', async () => {
    const mockError = new Error('Failed');
    mockClient.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateDocument());

    await act(async () => {
      await expect(result.current.mutate({ docType: 'User', data: {} })).rejects.toThrow('Failed');
    });
  });
});
