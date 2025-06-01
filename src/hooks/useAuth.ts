import { useState } from "react"
import { useFrappeClient } from "./useFrappeClient"

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<string | null>()
    const { axiosInstance } = useFrappeClient()

    async function loginWithPassword(email: string, password: string) {
        const response = await axiosInstance?.post(`/api/method/login`, {
            usr: email,
            pwd: password
        })
        if (response?.data) {
            return response.data
        } else {
            return null
        }
    }


    return { loginWithPassword, currentUser }
}
