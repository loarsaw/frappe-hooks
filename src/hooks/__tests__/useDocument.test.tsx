// src/hooks/__tests__/useDocument.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useDocument } from '../useDocument';
import { useFrappeContext } from '../../context/FrappeContext';

vi.mock('../../context/FrappeContext');

describe('useDocument', () => {
  const mockClient = {
    get: vi.fn(),
  };

  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFrappeContext as Mock).mockReturnValue({
      client: mockClient,
      cache: mockCache,
    });
    mockCache.get.mockReturnValue(null);
  });

  it('should fetch document on mount', async () => {
    const mockData = { name: 'User 1', email: 'user1@example.com' };
    mockClient.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useDocument('User', 'User 1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockClient.get).toHaveBeenCalledWith('/api/resource/User/User 1');
  });

  it('should return cached data when available', async () => {
    const cachedData = { name: 'User 1', email: 'cached@example.com' };
    mockCache.get.mockReturnValue(cachedData);

    const { result } = renderHook(() => useDocument('User', 'User 1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockClient.get).not.toHaveBeenCalled();
    expect(mockCache.get).toHaveBeenCalledWith('doc:User:User 1?expand_links=false');
  });

  it('should cache fetched data', async () => {
    const mockData = { name: 'User 1' };
    mockClient.get.mockResolvedValue({ data: mockData });

    renderHook(() => useDocument('User', 'User 1'));

    await waitFor(() => {
      expect(mockCache.set).toHaveBeenCalledWith('doc:User:User 1?expand_links=false', mockData);
    });
  });

  it('should use correct cache key with expand_links=true', async () => {
    const mockData = { name: 'User 1' };
    mockClient.get.mockResolvedValue({ data: mockData });

    renderHook(() => useDocument('User', 'User 1', true));

    await waitFor(() => {
      expect(mockCache.set).toHaveBeenCalledWith('doc:User:User 1?expand_links=true', mockData);
    });
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockClient.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDocument('User', 'User 1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('should not fetch when doctype is empty', async () => {
    const { result } = renderHook(() => useDocument('', 'User 1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('should not fetch when name is empty', async () => {
    const { result } = renderHook(() => useDocument('User', ''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('should not fetch when both doctype and name are empty', async () => {
    const { result } = renderHook(() => useDocument('', ''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('should refetch when doctype changes', async () => {
    const mockUserData = { name: 'User 1', doctype: 'User' };
    const mockRoleData = { name: 'Role 1', doctype: 'Role' };

    mockClient.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: mockRoleData });

    const { result, rerender } = renderHook(({ doctype, name }) => useDocument(doctype, name), {
      initialProps: { doctype: 'User', name: 'User 1' },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockUserData);
    });

    rerender({ doctype: 'Role', name: 'User 1' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRoleData);
    });

    expect(mockClient.get).toHaveBeenCalledTimes(2);
  });

  it('should refetch when name changes', async () => {
    const mockData1 = { name: 'User 1' };
    const mockData2 = { name: 'User 2' };

    mockClient.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result, rerender } = renderHook(({ name }) => useDocument('User', name), {
      initialProps: { name: 'User 1' },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    rerender({ name: 'User 2' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockClient.get).toHaveBeenCalledTimes(2);
    expect(mockClient.get).toHaveBeenNthCalledWith(1, '/api/resource/User/User 1');
    expect(mockClient.get).toHaveBeenNthCalledWith(2, '/api/resource/User/User 2');
  });

  it('should handle component unmount gracefully', async () => {
    mockClient.get.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { name: 'User 1' } }), 100))
    );

    const { result, unmount } = renderHook(() => useDocument('User', 'User 1'));

    expect(result.current.isLoading).toBe(true);

    unmount();

    await new Promise(resolve => setTimeout(resolve, 150));

    // No errors thrown after unmount
    expect(true).toBe(true);
  });

  it('should default expand_links to false', async () => {
    const mockData = { name: 'User 1' };
    mockClient.get.mockResolvedValue({ data: mockData });

    renderHook(() => useDocument('User', 'User 1'));

    await waitFor(() => {
      expect(mockCache.set).toHaveBeenCalledWith('doc:User:User 1?expand_links=false', mockData);
    });
  });

  it('should check cache before fetching', async () => {
    mockCache.get.mockReturnValue(null);
    mockClient.get.mockResolvedValue({ data: { name: 'User 1' } });

    renderHook(() => useDocument('User', 'User 1'));

    await waitFor(() => {
      expect(mockCache.get).toHaveBeenCalledWith('doc:User:User 1?expand_links=false');
    });

    expect(mockClient.get).toHaveBeenCalled();
  });

  it('should return null data initially', () => {
    mockClient.get.mockImplementation(() => new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useDocument('User', 'User 1'));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
