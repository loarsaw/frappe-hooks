import { useEffect } from "react"
import { getUtils } from ".."

export function useFrappeClient() {
    const { axiosInstance, initialized } = getUtils()
    useEffect(() => {
        if (axiosInstance == null || !initialized) {
            throw new Error("Seems like there no Frappe Instance Existing")

        }
    }, [axiosInstance, initialized])
    return {
        axiosInstance
    }
}