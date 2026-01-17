import { FrappeClient } from '../core/client';

export * from './url-builder';
export * from './request';

export function getUtils(client: FrappeClient) {
  return {
    async call(method: string, args?: Record<string, any>) {
      return client.post(`/api/method/${method}`, args);
    },

    async getDoc(doctype: string, name: string) {
      return client.get(`/api/resource/${doctype}/${name}`);
    },

    async getList(doctype: string, options?: any) {
      return client.get(`/api/resource/${doctype}`, options);
    },

    async setDoc(doctype: string, name: string, data: any) {
      return client.put(`/api/resource/${doctype}/${name}`, data);
    },

    async deleteDoc(doctype: string, name: string) {
      return client.delete(`/api/resource/${doctype}/${name}`);
    },
  };
}
