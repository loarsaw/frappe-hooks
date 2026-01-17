import { QueryOptions, Filter } from '../types';

export function buildUrl(baseUrl: string, options?: QueryOptions, filters?: Filter[]): string {
  const params = new URLSearchParams();

  if (options?.fields) {
    params.append('fields', JSON.stringify(options.fields));
  }

  if (filters) {
    params.append('filters', JSON.stringify(filters));
  }

  if (options?.limit_page_length) {
    params.append('limit_page_length', options.limit_page_length.toString());
  }

  if (options?.limit_start) {
    params.append('limit_start', options.limit_start.toString());
  }

  if (options?.order_by) {
    params.append('order_by', options.order_by);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Alias for compatibility
export const buildQueryUrl = buildUrl;
