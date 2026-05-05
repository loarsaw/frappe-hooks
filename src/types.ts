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
  // Setting OR filter
  is_or?: boolean;
  order_by?: string;
  // You can specify which fields to expand in the expand param
  // GET /api/resource/:doctype?expand=["priority"]
  expand?: string[];
  // By default, you will receive the data as List[dict]. You can retrieve your data as List[List] by passing as_dict=False
  as_dict?: boolean;
  // To debug the query built for your reqeusts, you can pass debug=True with the request. This returns the executed query and execution time under exc of the payload
  // Default value is rendered false, Keep it false in production , shooot this ins't documentation , so why am I wiritng it here , IDK
  debug?: boolean;
}

export type Filter = [string, string, string, string | number | boolean];

export interface MutationOptions<TData, _TVariables = unknown> {
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

export interface UploadFileOptions {
  // Attach to a specific document
  doctype?: string;
  docname?: string;
  fieldname?: string;
  // Store as private file (default: public)
  isPrivate?: boolean;
  // Destination folder in File Manager
  folder?: string;
}

export interface UploadFileResponse {
  name: string;
  file_name: string;
  file_url: string;
  is_private: 0 | 1;
  file_size: number;
}
