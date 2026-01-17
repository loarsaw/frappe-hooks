import { FrappeClient } from '../core/client';

export async function makeRequest<T>(
  client: FrappeClient,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> {
  switch (method) {
    case 'GET':
      return client.get<T>(url, data);
    case 'POST':
      return client.post<T>(url, data);
    case 'PUT':
      return client.put<T>(url, data);
    case 'DELETE':
      return client.delete<T>(url);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}
