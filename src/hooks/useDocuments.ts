import { useEffect, useState } from "react";
import { useFrappeClient } from "./useFrappeClient";
import { ApiResponse, InputData, UseFetchResult } from "../types";
import { listingBuilder } from "../utils/url-builder";

export function useDocuments<T = any>({ docType, query, enabled = true, filters, isOR }: InputData): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [docTypeUrl, setDocTypeUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null);
    const { baseUrl } = useFrappeClient()
    const { initialized } = useFrappeClient()
    useEffect(() => {
        if (!docType || !baseUrl) return;
        if (enabled) {
            const controller = new AbortController();
            const signal = controller.signal;
            setIsLoading(true);
            setError(null);
            if (query == undefined) {
                setDocTypeUrl(`${baseUrl}/api/resource/${docType}`)
            } else {
                setDocTypeUrl(listingBuilder(`${baseUrl}/api/resource/${docType}`, { limit_page_length: query.limit_page_length, limit_start: query.limit_start, fieldsArray: query.fieldsArray }, filters, isOR))
            }
            if (docTypeUrl)
                fetch(docTypeUrl, { signal, credentials: "include" })
                    .then((res) => {
                        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                        return res.json() as Promise<ApiResponse<any>>;
                    })
                    .then((data: { data: any }) => setData(data.data))
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

    }, [docType, docTypeUrl, enabled, query?.limit_start, initialized]);

    return { data, isLoading, error };
}
