import useSWR, { SWRConfiguration, SWRResponse, mutate } from 'swr';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const defaultFetcher = async (url: string): Promise<any> => {
  const response = await axios.get(url, {
    withCredentials: true
  });
  return response.data;
};

const buildUrl = (base: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const queryPairs: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });

  const queryString = queryPairs.join('&');
  return queryString ? `${base}?${queryString}` : base;
};

// CREATE Hook
export function useCreate<TData = any, TResponse = any>(
  baseUrl: string, 
  bodyParams?: Record<string, any>,
  axiosConfig?: AxiosRequestConfig,
  options?: SWRConfiguration
) {
  const create = async (data: TData): Promise<TResponse> => {
    const requestBody = {
      ...bodyParams,
      ...data
    };

    const config: AxiosRequestConfig = {
      withCredentials: true,
      ...axiosConfig
    };

    const response: AxiosResponse<TResponse> = await axios.post(
      baseUrl, 
      requestBody, 
      config
    );

    // Revalidate related data
    mutate(baseUrl);
    return response.data;
  };

  return { create };
}

// READ Hook
export function useRead<T = any>(
  url: string, 
  params?: Record<string, any>, 
  axiosConfig?: AxiosRequestConfig,
  options?: SWRConfiguration
): SWRResponse<T, Error> {
  const fullUrl = buildUrl(url, params);
  
  const fetcher = async (url: string) => {
    const config: AxiosRequestConfig = {
      withCredentials: true,
      ...axiosConfig
    };
    
    const response = await axios.get(url, config);
    return response.data;
  };
  
  return useSWR<T, Error>(
    fullUrl,
    options?.fetcher || fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options
    }
  );
}

// UPDATE Hook
export function useUpdate<TData = any, TResponse = any>(
  baseUrl: string, 
  bodyParams?: Record<string, any>,
  axiosConfig?: AxiosRequestConfig,
  options?: SWRConfiguration
) {
  const update = async (id: string | number, data: TData): Promise<TResponse> => {
    const requestBody = {
      ...bodyParams,
      ...data
    };

    const config: AxiosRequestConfig = {
      withCredentials: true,
      ...axiosConfig
    };

    const response: AxiosResponse<TResponse> = await axios.put(
      `${baseUrl}/${id}`, 
      requestBody, 
      config
    );

    // Revalidate related data
    mutate(baseUrl);
    mutate(`${baseUrl}/${id}`);
    return response.data;
  };

  return { update };
}

// DELETE Hook
export function useDelete<TData = any, TResponse = any>(
  baseUrl: string, 
  bodyParams?: Record<string, any>,
  axiosConfig?: AxiosRequestConfig,
  options?: SWRConfiguration
) {
  const deleteItem = async (id: string | number, data?: TData): Promise<TResponse> => {
    const requestBody = data ? {
      ...bodyParams,
      ...data
    } : bodyParams;

    const config: AxiosRequestConfig = {
      withCredentials: true,
      ...axiosConfig,
      ...(requestBody && { data: requestBody })
    };

    const response: AxiosResponse<TResponse> = await axios.delete(
      `${baseUrl}/${id}`, 
      config
    );

    // Revalidate related data
    mutate(baseUrl);
    mutate(`${baseUrl}/${id}`);
    return response.data;
  };

  return { delete: deleteItem };
}

// Re-export types for convenience
export type { SWRConfiguration, SWRResponse } from 'swr';
export type { AxiosRequestConfig, AxiosResponse } from 'axios';