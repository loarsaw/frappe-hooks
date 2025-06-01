import { useEffect, useState } from "react"
import { useFrappeClient } from "./useFrappeClient"
import { useFrappe } from "../lib/provider/FrappeProvider"

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<string | null>()
    const [attemptSuccess, setAttemptSuccess] = useState<boolean>(false)
    const { axiosInstance } = useFrappeClient()

    useEffect(() => {
        getCurrentUser()
    }, [attemptSuccess])

    async function getCurrentUser() {
        const data = await axiosInstance?.get("/api/method/frappe.auth.get_logged_user")
        setCurrentUser(data?.data.message)
    }
    async function logout() {
        const response = await axiosInstance?.get(`/api/method/logout`)
        if (response?.data) {
            setAttemptSuccess(false)
            setCurrentUser(null)
        } else {
            return null
        }
    }
    async function loginWithPassword(email: string, password: string) {
        const response = await axiosInstance?.post(`/api/method/login`, {
            usr: email,
            pwd: password
        })
        if (response?.data) {
            setAttemptSuccess(true)
            return response.data
        } else {
            setAttemptSuccess(false)
            return null
        }
    }


    return { loginWithPassword, currentUser, logout }
}
