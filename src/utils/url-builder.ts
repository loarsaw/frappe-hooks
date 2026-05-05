import { QueryOptions, Filter } from '../types';

export function buildUrl(
  baseUrl: string,
  options?: QueryOptions,
  filters?: Filter[],
  is_or?: boolean
): string {
  const params = new URLSearchParams();

  if (options?.fields) {
    params.append('fields', JSON.stringify(options.fields));
  }

  if (filters) {
    if (is_or) {
      params.append('or_filters', JSON.stringify(filters));
    } else {
      params.append('filters', JSON.stringify(filters));
    }
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

  if (options?.expand) {
    params.append('expand', JSON.stringify(options.expand));
  }

  if (options?.as_dict === false) {
    params.append('as_dict', '0');
  }

  if (options?.debug) {
    params.append('debug', '1');
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export const buildQueryUrl = buildUrl;
