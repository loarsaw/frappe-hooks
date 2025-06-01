import { AxiosRequestConfig } from "axios";

export interface IFrappeInstance {
  baseURL: string,
  token?: string
}

export interface IListingBuilder {
  limit_page_length?: number | null, limit_start?: number | null, f_array?: string[]
}