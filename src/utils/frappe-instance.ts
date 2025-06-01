import axios, { AxiosInstance } from 'axios';
import { IFrappeInstance } from '../types'
let axiosInstance: AxiosInstance | null = null;
let isInitialized = false;

export function initializeClient(config: IFrappeInstance, force = false) {
    if (isInitialized && !force) {
        return axiosInstance;
    }
    const {
        baseURL,
        token
    } = config;

    axiosInstance = axios.create({
        baseURL: baseURL.replace(/\/$/, ''),
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `token ${token}` }),
        },
        withCredentials: true
    });

    isInitialized = true;

    return axiosInstance;
}

export function getFrappeClient() {
    if (!axiosInstance) {
        throw new Error('HTTP client not initialized. Call initializeHttpClient() first.');
    }
    return axiosInstance;
}

export function isFrappeClientInitialized() {
    return isInitialized && axiosInstance !== null;
}
