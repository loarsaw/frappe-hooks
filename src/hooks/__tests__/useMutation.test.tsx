// src/hooks/__tests__/useMutation.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useMutation } from '../useMutation';
import { useFrappe } from '../../context/FrappeContext';

vi.mock('../../context/FrappeContext');

describe('useMutation', () => {
  const mockClient = {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFrappe as Mock).mockReturnValue({ client: mockClient });
  });

  it('should return mutate function, isLoading, and error', () => {
    const { result } = renderHook(() => useMutation(async () => 'data', {}));

    expect(typeof result.current.mutate).toBe('function');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set isLoading to true during mutation', async () => {
    let resolvePromise!: (value: string) => void;
    const mutationFn = vi.fn(
      () =>
        new Promise<string>(resolve => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate('variables');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise('done');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call mutationFn with variables and client', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result');

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    expect(mutationFn).toHaveBeenCalledWith({ id: 1 }, mockClient);
  });

  it('should call onSuccess with returned data', async () => {
    const mockData = { name: 'User 1' };
    const onSuccess = vi.fn();
    const mutationFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useMutation(mutationFn, { onSuccess }));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should return data from mutate call', async () => {
    const mockData = { name: 'User 1' };
    const mutationFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    let returned: any;
    await act(async () => {
      returned = await result.current.mutate({});
    });

    expect(returned).toEqual(mockData);
  });

  it('should set error state on failure', async () => {
    const mockError = new Error('Mutation failed');
    const mutationFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    await act(async () => {
      try {
        await result.current.mutate({});
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it('should call onError with the error on failure', async () => {
    const mockError = new Error('Mutation failed');
    const onError = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useMutation(mutationFn, { onError }));

    await act(async () => {
      try {
        await result.current.mutate({});
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should rethrow error from mutate', async () => {
    const mockError = new Error('Mutation failed');
    const mutationFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    await act(async () => {
      await expect(result.current.mutate({})).rejects.toThrow('Mutation failed');
    });
  });

  it('should clear error on subsequent successful mutation', async () => {
    const mockError = new Error('First call failed');
    const mutationFn = vi.fn().mockRejectedValueOnce(mockError).mockResolvedValueOnce('success');

    const { result } = renderHook(() => useMutation(mutationFn, {}));

    await act(async () => {
      try {
        await result.current.mutate({});
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(result.current.error).toEqual(mockError);

    await act(async () => {
      await result.current.mutate({});
    });

    expect(result.current.error).toBeNull();
  });

  it('should not call onSuccess when mutation fails', async () => {
    const onSuccess = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useMutation(mutationFn, { onSuccess }));

    await act(async () => {
      try {
        await result.current.mutate({});
      } catch (_e) {
        /* expected to throw */
      }
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should not call onError when mutation succeeds', async () => {
    const onError = vi.fn();
    const mutationFn = vi.fn().mockResolvedValue('ok');

    const { result } = renderHook(() => useMutation(mutationFn, { onError }));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle multiple sequential mutations', async () => {
    const onSuccess = vi.fn();
    const mutationFn = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');

    const { result } = renderHook(() => useMutation(mutationFn, { onSuccess }));

    await act(async () => {
      await result.current.mutate('a');
    });
    await act(async () => {
      await result.current.mutate('b');
    });

    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenNthCalledWith(1, 'first');
    expect(onSuccess).toHaveBeenNthCalledWith(2, 'second');
  });
});
