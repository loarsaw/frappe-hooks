import { useEffect } from "react"
import { getUtils } from ".."

export function useFrappeClient() {
    const { initialized, setUpdate, baseUrl } = getUtils()
    useEffect(() => {
        if (baseUrl == null || !initialized) {
            throw new Error("Seems like there no Frappe Instance Existing")

        }
    }, [initialized])
    return {
        setUpdate,
        initialized,
        baseUrl
    }
}