import useSWR, { SWRConfiguration, SWRResponse, mutate } from 'swr';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IFrappeInstance } from './types';
import { deleteAllCookies } from './utils/utils';

export class FrappeClient {
  private axiosInstance: AxiosInstance | null = null;
  private tokenProvided: boolean = false
  private currentUser: string | null = null
  private static instance: FrappeClient;
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
  }
  public static getInstance(options?: IFrappeInstance): FrappeClient {
    if (!FrappeClient.instance) {
      if (options) {
        if (!options.baseURL) {
          throw new Error("Server URL not provided")
        }
        FrappeClient.instance = new FrappeClient({ baseURL: options.baseURL, token: options.token })
      }
    }
    return FrappeClient.instance
  }
  logoutUser() {
    this.currentUser == null
    deleteAllCookies()
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
  async getAllDocuments(docType: string, data: any) {
    const response = await this.axiosInstance?.get(`/api/resource/${docType}`)
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

// Re-export types for convenience
export type { SWRConfiguration, SWRResponse } from 'swr';
export type { AxiosRequestConfig, AxiosResponse } from 'axios';