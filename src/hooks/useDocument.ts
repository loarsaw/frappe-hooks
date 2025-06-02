import { useEffect, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import { useFrappeClient } from "./useFrappeClient";

interface UseDocumentResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    updateDocument: (docType: string, documentId: string, data: T) => Promise<any>;
    createDocument: (docType: string, data: T) => Promise<any>;
    deleteDocument: (docType: string, documentId: string) => Promise<any>;
}

export function useDocument<T = any>(docType?: string, documentId?: string, enabled: boolean = true): UseDocumentResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { axiosInstance } = useFrappeClient()
    const [refetch, setRefetch] = useState(Date.now())
    useEffect(() => {
        if (!docType || !documentId) return;
        if (enabled) {
            const source: CancelTokenSource = axios.CancelToken.source();
            setIsLoading(true);
            setError(null);
            axiosInstance?.get<T>(`/api/resource/${docType}/${documentId}`, { cancelToken: source.token })
                .then((res) => setData(res.data))
                .catch((err) => {
                    if (!axios.isCancel(err)) {
                        setError(err.message || "Unknown error");
                    }
                })
                .finally(() => {
                    if (!source.token.reason) {
                        setIsLoading(false);
                    }
                });

            return () => {
                source.cancel("Request cancelled due to component unmount or docType change.");
            };
        }

    }, [docType, enabled, refetch, documentId]);

    async function updateDocument(docType: string, documentId: string, updated_data: T) {
        const response = await axiosInstance?.put(`/api/resource/${docType}/${documentId}`, updated_data)
        if (response?.data) {
            setRefetch(Date.now())
            return response.data
        } else {
            return null
        }
    }

    async function createDocument(docType: string, data: T) {
        const response = await axiosInstance?.post(`/api/resource/${docType}`, data)
        if (response?.data) {
            return response.data
        } else {
            return null
        }
    }

    async function deleteDocument(docType: string, documentId: string) {
        const response = await axiosInstance?.delete(`/api/resource/${docType}/${documentId}`)
        if (response?.data) {
            return response.data
        } else {
            return null
        }
    }



    return { data, isLoading, error, updateDocument, deleteDocument, createDocument };
}
