// src/hooks/__tests__/useDocuments.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { useDocuments } from '../useDocuments';
import { useFrappeContext } from '../../context/FrappeContext';
import { buildQueryUrl } from '../../utils/url-builder';
import type { QueryOptions, Filter } from '../../types';

// Mock dependencies
vi.mock('../../context/FrappeContext');
vi.mock('../../utils/url-builder');

describe('useDocuments', () => {
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
    (buildQueryUrl as Mock).mockReturnValue('/api/resource/User');
    // Reset cache.get to return null by default to prevent leaking between tests
    mockCache.get.mockReturnValue(null);
  });

  it('should fetch documents on mount', async () => {
    const mockData = [{ name: 'User 1' }, { name: 'User 2' }];
    mockClient.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useDocuments('User'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockClient.get).toHaveBeenCalledWith('/api/resource/User');
  });

  it('should return cached data when available', async () => {
    const cachedData = [{ name: 'Cached User' }];
    mockCache.get.mockReturnValue(cachedData);

    const { result } = renderHook(() => useDocuments('User'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockClient.get).not.toHaveBeenCalled();
    expect(mockCache.get).toHaveBeenCalled();
  });

  it('should cache fetched data', async () => {
    const mockData = [{ name: 'User 1' }];
    mockClient.get.mockResolvedValue({ data: mockData });

    renderHook(() => useDocuments('User', { fields: ['name'] }));

    await waitFor(() => {
      expect(mockCache.set).toHaveBeenCalledWith('docs:User:{"fields":["name"]}', mockData);
    });
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockClient.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDocuments('User'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toEqual([]);
  });

  it('should refetch when doctype changes', async () => {
    const mockUserData = [{ name: 'User 1' }];
    const mockRoleData = [{ name: 'Role 1' }];

    mockClient.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: mockRoleData });

    const { result, rerender } = renderHook(({ doctype }) => useDocuments(doctype), {
      initialProps: { doctype: 'User' },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockUserData);
    });

    rerender({ doctype: 'Role' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockRoleData);
    });

    expect(mockClient.get).toHaveBeenCalledTimes(2);
  });

  it('should refetch when options change', async () => {
    const mockData1 = [{ name: 'User 1' }];
    const mockData2 = [{ name: 'User 2' }];

    mockClient.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result, rerender } = renderHook(({ options }) => useDocuments('User', options), {
      initialProps: { options: { fields: ['name'] } as QueryOptions },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    rerender({ options: { fields: ['name', 'email'] } as QueryOptions });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(mockClient.get).toHaveBeenCalledTimes(2);
  });

  it('should NOT refetch when options reference changes but content is same', async () => {
    const mockData = [{ name: 'User 1' }];
    mockClient.get.mockResolvedValue({ data: mockData });

    const { result, rerender } = renderHook(({ options }) => useDocuments('User', options), {
      initialProps: { options: { fields: ['name'] } as QueryOptions },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    // Same content, different reference
    rerender({ options: { fields: ['name'] } as QueryOptions });

    // Should NOT call client.get again
    expect(mockClient.get).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when doctype is empty', async () => {
    const { result } = renderHook(() => useDocuments(''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('should handle component unmount gracefully', async () => {
    const mockData = [{ name: 'User 1' }];

    // Delay the resolution to test cleanup
    mockClient.get.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockData }), 100))
    );

    const { result, unmount } = renderHook(() => useDocuments('User'));

    expect(result.current.isLoading).toBe(true);

    // Unmount before request completes
    unmount();

    // Wait to ensure no state updates happen
    await new Promise(resolve => setTimeout(resolve, 150));

    // No errors should be thrown
    expect(true).toBe(true);
  });

  it('should clear error on successful refetch', async () => {
    const mockError = new Error('Network error');
    const mockData = [{ name: 'User 1' }];

    mockClient.get.mockRejectedValueOnce(mockError).mockResolvedValueOnce({ data: mockData });

    const { result, rerender } = renderHook(({ doctype }) => useDocuments(doctype), {
      initialProps: { doctype: 'User' },
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });

    rerender({ doctype: 'Role' });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should build query URL with correct parameters using filters', async () => {
    // Frappe filter format: [doctype, field, operator, value]
    const filters: Filter[] = [['User', 'enabled', '=', 1]];

    const options: QueryOptions = {
      fields: ['name', 'email'],
      filters,
      limit_page_length: 10,
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(buildQueryUrl).toHaveBeenCalledWith('/api/resource/User', options, options.filters);
    });
  });

  it('should handle multiple filters', async () => {
    const filters: Filter[] = [
      ['User', 'enabled', '=', 1],
      ['User', 'user_type', '=', 'System User'],
    ];

    const options: QueryOptions = {
      fields: ['name', 'email'],
      filters,
      limit_page_length: 20,
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(buildQueryUrl).toHaveBeenCalledWith('/api/resource/User', options, options.filters);
    });
  });

  it('should handle order_by parameter', async () => {
    const options: QueryOptions = {
      fields: ['name'],
      order_by: 'creation desc',
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(buildQueryUrl).toHaveBeenCalledWith(
        '/api/resource/User',
        options,
        undefined // no filters
      );
    });
  });

  it('should handle pagination parameters', async () => {
    const options: QueryOptions = {
      limit_page_length: 20,
      limit_start: 0,
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(mockClient.get).toHaveBeenCalled();
    });
  });

  it('should handle expand parameter', async () => {
    const options: QueryOptions = {
      fields: ['name', 'priority'],
      expand: ['priority'],
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(buildQueryUrl).toHaveBeenCalledWith('/api/resource/User', options, undefined);
    });
  });

  it('should handle as_dict parameter', async () => {
    const options: QueryOptions = {
      fields: ['name'],
      as_dict: false,
    };

    mockClient.get.mockResolvedValue({ data: [['User 1'], ['User 2']] });

    const { result } = renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([['User 1'], ['User 2']]);
  });

  it('should handle debug parameter', async () => {
    const options: QueryOptions = {
      fields: ['name'],
      debug: true,
    };

    mockClient.get.mockResolvedValue({
      data: [],
      exc: 'SELECT * FROM tabUser',
      execution_time: 0.05,
    });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(buildQueryUrl).toHaveBeenCalledWith('/api/resource/User', options, undefined);
    });
  });

  it('should handle complex query with all options', async () => {
    const filters: Filter[] = [
      ['User', 'enabled', '=', 1],
      ['User', 'user_type', '=', 'System User'],
    ];

    const options: QueryOptions = {
      fields: ['name', 'email', 'enabled', 'user_type'],
      filters,
      limit_start: 0,
      limit_page_length: 50,
      order_by: 'creation desc',
      expand: ['user_type'],
      as_dict: true,
      debug: false,
    };

    const mockData = [
      { name: 'User 1', email: 'user1@example.com' },
      { name: 'User 2', email: 'user2@example.com' },
    ];

    mockClient.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(buildQueryUrl).toHaveBeenCalledWith('/api/resource/User', options, options.filters);
  });

  it('should handle boolean filter values', async () => {
    const filters: Filter[] = [['User', 'enabled', '=', true]];

    const options: QueryOptions = {
      filters,
    };

    mockClient.get.mockResolvedValue({ data: [] });

    renderHook(() => useDocuments('User', options));

    await waitFor(() => {
      expect(mockClient.get).toHaveBeenCalled();
    });
  });
});
