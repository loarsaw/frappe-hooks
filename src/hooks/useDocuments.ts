import { useEffect, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import { useFrappeClient } from "./useFrappeClient";
import { InputData, UseFetchResult } from "../types";
import { listingBuilder } from "../utils/url-builder";



export function useDocuments<T = any>({ docType, query, enabled = true }: InputData): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [docTypeUrl, setDocTypeUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null);
    const { axiosInstance } = useFrappeClient()
    useEffect(() => {
        if (!docType) return;

        if (enabled) {

            const source: CancelTokenSource = axios.CancelToken.source();

            setIsLoading(true);
            setError(null);
            if (query == undefined) {
                setDocTypeUrl(`/api/resource/${docType}`)
            } else {
                setDocTypeUrl(listingBuilder(`/api/resource/${docType}`, { limit_page_length: query.limit_page_length, limit_start: query.limit_start, fieldsArray: query.fieldsArray }))
            }
            if (docTypeUrl)
                axiosInstance?.get<T>(docTypeUrl, { cancelToken: source.token })
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

    }, [docType, docTypeUrl, enabled, query?.limit_start]);

    return { data, isLoading, error };
}
