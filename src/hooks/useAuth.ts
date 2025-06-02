import { useEffect, useState } from "react"
import { useFrappeClient } from "./useFrappeClient"

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<string | null>()
    const [attemptSuccess, setAttemptSuccess] = useState<boolean>(false)
    const { baseUrl } = useFrappeClient()
    useEffect(() => {
        getCurrentUser()
    }, [attemptSuccess])

    async function getCurrentUser() {
        const { signal } = new AbortController()
        const url = `${baseUrl}/api/method/frappe.auth.get_logged_user`
        fetch(url, {
            signal,
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json() as Promise<any>;
            })
            .then((data) => {
                setCurrentUser(data.message)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                }
            })
            .finally(() => {
                if (!signal.aborted) {
                }
            });
    }
    async function logout() {
        const { signal } = new AbortController()
        const url = `${baseUrl}/api/method/logout`
        fetch(url, {
            signal,
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                return res.json() as Promise<any>;
            })
            .then((data) => {
                setCurrentUser(null)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {

                }
            })
            .finally(() => {
                if (!signal.aborted) {

                }
            });
    }
    async function loginWithPassword(email: string, password: string) {

        const { signal } = new AbortController();
        const url = `${baseUrl}/api/method/login`
        fetch(url, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            signal,
            body: JSON.stringify({
                usr: email,
                pwd: password
            }),
        }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json()
        }).catch((err) => {
            if (err.name !== "AbortError") {

            }
        })
            .finally(() => {
                if (!signal.aborted) {

                }
            });

    }


    return { loginWithPassword, currentUser, logout }
}
