export interface IFrappeInstance {
  baseURL: string,
  token?: string
}

export interface IListingBuilder {
  limit_page_length?: number | null, limit_start?: number | null, fieldsArray?: string[]
}

export interface ApiResponse<D> {
  data: D;
}

export interface UseDocumentResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  updateDocument: (docType: string, documentId: string, data: T) => Promise<any>;
  createDocument: (docType: string, data: T) => Promise<any>;
  deleteDocument: (docType: string, documentId: string) => Promise<any>;
  refetch: () => void
}

export interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}


export interface IOperand {
  GT: string,
  LT: string;
  EQ: string;
  NEQ: string;
}

export interface IFilterOptions {
  query: string,
  operand: "GT" | "LT" | "EQ" | "NEQ",
  value: string
}

export interface IFilter {
  filters: IFilterOptions[]
}

interface InputDataWithFilters {
  docType: string;
  query?: IListingBuilder;
  enabled?: boolean;
  filters: IFilterOptions[];
  isOR?: boolean;
}

interface InputDataWithoutFilters {
  docType: string;
  query?: IListingBuilder;
  enabled?: boolean;
  filters?: undefined;
  isOR?: undefined;
}

export type InputData = InputDataWithFilters | InputDataWithoutFilters;