import { AxiosRequestConfig } from "axios";

export interface IFrappeInstance extends AxiosRequestConfig {
  baseURL: string,
  token?: string
}