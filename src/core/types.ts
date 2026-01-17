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

export class FrappeError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'FrappeError';
  }
}
