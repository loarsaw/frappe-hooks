export interface FrappeClientOptions {
  url: string;
  token?: string;
  username?: string;
  password?: string;
  useToken?: boolean;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface QueryOptions {
  fields?: string[];
  filters?: Filter[];
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

export type Filter = [string, string, string, string | number | boolean];

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidate?: string[] | string | RegExp;
}

export interface IFrappeInstance {
  client: any;
  cache: any;
}

export class FrappeError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'FrappeError';
  }
}
