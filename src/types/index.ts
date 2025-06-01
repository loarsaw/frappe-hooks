import { AxiosRequestConfig } from "axios";

export interface IFrappeInstance {
  baseURL: string,
  token?: string
}

export interface IListingBuilder {
  limit_page_length?: number | null, limit_start?: number | null, fieldsArray?: string[]
}

export interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface InputData {
  docType: string
  query?: IListingBuilder | undefined,
  enabled?: boolean
}