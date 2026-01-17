import { FrappeClientOptions, RequestConfig, FrappeError } from './types';

export class FrappeClient {
  private baseUrl: string;
  private token?: string;
  private username?: string;
  private password?: string;

  constructor(options: FrappeClientOptions) {
    this.baseUrl = options.url;
    this.token = options.token;
    this.username = options.username;
    this.password = options.password;
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const url = `${this.baseUrl}${config.url}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(url, {
      method: config.method,
      headers,
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new FrappeError(response.status, text);
    }

    return response.json();
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>({
      method: 'GET',
      url: url + queryString,
    });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
    });
  }
}
