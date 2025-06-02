import { useEffect, useState } from "react";
import { useFrappeClient } from "./useFrappeClient";
import { UseDocumentResult } from "../types";

export function useDocument<T = any>(docType?: string, documentId?: string, enabled: boolean = true): UseDocumentResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setUpdate } = useFrappeClient()
    const { baseUrl } = useFrappeClient()
    const [re_fetch, setRefetch] = useState(Date.now())
    useEffect(() => {
        if (!docType || !documentId) return;
        if (enabled) {
            const controller = new AbortController();
            const signal = controller.signal;
            setIsLoading(true);
            setError(null);
            const url = `${baseUrl}/api/resource/${docType}/${documentId}`
            fetch(url, {
                signal,
                credentials: "include",
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    return res.json() as Promise<T>;
                })
                .then((data) => setData(data))
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        setError(err.message || "Unknown error");
                    }
                })
                .finally(() => {
                    if (!signal.aborted) {
                        setIsLoading(false);
                    }
                });

            return () => {
                controller.abort();
            };
        }

    }, [docType, enabled, re_fetch, documentId]);

    async function refetch() {
        setRefetch(Date.now())
    }
    async function updateDocument(docType: string, documentId: string, updated_data: T) {
        const url = `${baseUrl}/api/resource/${docType}/${documentId}`
        const { signal } = new AbortController()
        fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            signal,
            body: JSON.stringify(updated_data),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            })
            .then(() => {
                setUpdate()
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unknown error");
                }
            })
            .finally(() => {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            });
    }

    async function createDocument(docType: string, data: T) {
        const { signal } = new AbortController();
        const url = `${baseUrl}/api/resource/${docType}`
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            signal,
            body: JSON.stringify(data),
        }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json()
        }).then((data) => {
            setUpdate()
            return data.data
        })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unknown error");
                }
            })
            .finally(() => {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            });

    }

    async function deleteDocument(docType: string, documentId: string) {
        const url = `${baseUrl}/api/resource/${docType}/${documentId}`
        const { signal } = new AbortController()
        fetch(url, {
            method: "DELETE",
            credentials: "include",
            signal,
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setUpdate()
                console.log(data);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unknown error");
                }
            })
            .finally(() => {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            });

    }



    return { data, isLoading, error, updateDocument, deleteDocument, createDocument, refetch };
}
