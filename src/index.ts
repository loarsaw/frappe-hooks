import useSWR, { SWRConfiguration, SWRResponse, mutate } from 'swr';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IFrappeInstance } from './types';

export class FrappeClient {
  private axiosInstance: AxiosInstance | null = null;
  constructor(options: IFrappeInstance) {
    this.axiosInstance = axios.create({
      baseURL: options.baseURL,
      withCredentials: true,
    })
  }
  async createDocument(docType: string, data: any) {
    const requestBody = {
      ...data
    }
    const response = await this.axiosInstance?.post(`/${docType}`, requestBody)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }
  async getAllDocuments(docType: string, data: any) {
    const response = await this.axiosInstance?.get(`/${docType}`)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }
  async getDocument(docType: string, documentId: string, data: any) {
    const response = await this.axiosInstance?.get(`/${docType}/${documentId}`)
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
    const response = await this.axiosInstance?.put(`/${docType}/${documentId}`, requestBody)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }
  async deleteDocument(docType: string, documentId: string) {
    const response = await this.axiosInstance?.delete(`/${docType}/${documentId}`)
    if (response?.data) {
      return response.data
    } else {
      return null
    }
  }

}


// Re-export types for convenience
export type { SWRConfiguration, SWRResponse } from 'swr';
export type { AxiosRequestConfig, AxiosResponse } from 'axios';