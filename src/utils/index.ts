import { FrappeClient } from '../core/client';
import { UploadFileOptions, UploadFileResponse } from '../types';

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

    async uploadFile(file: File, options?: UploadFileOptions): Promise<UploadFileResponse> {
      const formData = new FormData();
      formData.append('file', file, file.name);

      if (options?.doctype) formData.append('doctype', options.doctype);
      if (options?.docname) formData.append('docname', options.docname);
      if (options?.fieldname) formData.append('fieldname', options.fieldname);
      if (options?.isPrivate) formData.append('is_private', '1');
      if (options?.folder) formData.append('folder', options.folder);

      return client.post('/api/method/upload_file', formData);
    },
  };
}
