import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IFrappeInstance, IListingBuilder } from './types';
import { listingBuilder } from './utils/url-builder';
export * from "./lib/provider/FrappeProvider"
export * from "./hooks/useDocuments"
export * from "./hooks/useDocument"

export class FrappeClient {
  private axiosInstance: AxiosInstance | null = null;
  private tokenProvided: boolean = false
  private currentUser: string | null = null
  private static instance: FrappeClient;
  private initialized: boolean = false;
  private static options: IFrappeInstance = { baseURL: "", token: "" };
  constructor(options: IFrappeInstance) {
    if (options.token) {
      this.tokenProvided = true
    }
    this.axiosInstance = axios.create({
      baseURL: options.baseURL.replace(/\/$/, ''),
      withCredentials: true,
      headers: {
        ...(options.token && { Authorization: `token ${options.token}` }),
      },
    })
    this.initialized = true
    FrappeClient.options.baseURL = options.baseURL
    FrappeClient.options.token = options.token
  }

  public static getInstance(options?: IFrappeInstance): FrappeClient {
    if (!FrappeClient.instance) {
      if (options == undefined) {
        if (FrappeClient.options.baseURL !== '') {
          if (FrappeClient.options.baseURL == "") {
            throw new Error("Server URL not provided")
          }
        }
      } else {
        if (options.baseURL !== '') {
          if (options.baseURL == "") {
            throw new Error("Server URL not provided")
          }
        }
      }
      FrappeClient.instance = new FrappeClient({ baseURL: FrappeClient.options.baseURL, token: FrappeClient.options.token })
    }
    return FrappeClient.instance
  }

  getInitialized() {
    return this.initialized
  }
  logoutUser() {
    this.currentUser == null
  }

  async updateUser() {
    const response = await this.axiosInstance?.post("/api/method/frappe.auth.get_logged_user")
    if (response?.data) {
      this.currentUser = response.data.message
      return response.data.message
    } else {
      return null
    }
  }

  async getCurrentUser() {
    const user = await this.updateUser()
    return user
  }

  async loginWithPassword(email: string, password: string) {
    const response = await this.axiosInstance?.post(`/api/method/login`, {
      usr: email,
      pwd: password
    })
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  async createDocument(docType: string, data: any) {
    const requestBody = {
      ...data
    }
    const response = await this.axiosInstance?.post(`/api/resource/${docType}`, requestBody)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  async getAllDocuments(docType: string, pagination: IListingBuilder) {
    const m_url = listingBuilder(`/api/resource/${docType}`, { limit_page_length: pagination.limit_page_length, limit_start: pagination.limit_start, fieldsArray: pagination.fieldsArray })
    const response = await this.axiosInstance?.get(m_url)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  getAxiosInstance() {
    return this.axiosInstance
  }

  async logout() {
    const response = await this.axiosInstance?.get(`/api/method/logout`)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  async getDocument(docType: string, documentId: string) {
    const response = await this.axiosInstance?.get(`/api/resource/${docType}/${documentId}`)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  async updateDocument(docType: string, documentId: string, data: any) {
    const requestBody = {
      ...data
    }
    const response = await this.axiosInstance?.put(`/api/resource/${docType}/${documentId}`, requestBody)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

  async deleteDocument(docType: string, documentId: string) {
    const response = await this.axiosInstance?.delete(`/api/resource/${docType}/${documentId}`)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }
}

export function getInstanceManager(): FrappeClient {
  return FrappeClient.getInstance()
}

export function getUtils(): { axiosInstance: AxiosInstance | null, initialized: boolean } {
  const client = FrappeClient.getInstance()
  const axiosInstance = client?.getAxiosInstance()
  const initialized = client?.getInitialized()
  return {
    axiosInstance, initialized
  }
}
export type { SWRConfiguration, SWRResponse } from 'swr';
export type { AxiosRequestConfig, AxiosResponse } from 'axios'