import { FrappeClient, getInstanceManager } from ".."
import { useEffect, useState } from 'react'

export const useAuth = () => {
    const [frappeInstance, setFrappeInstance] = useState<FrappeClient | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    console.log(frappeInstance)
    useEffect(() => {
        let retries = 5
        const retryDelay = 300 // ms
        const tryGetInstance = async () => {
            let instance = getInstanceManager()

            while (!instance && retries > 0) {
                await new Promise(res => setTimeout(res, retryDelay))
                instance = getInstanceManager()
                retries--
            }

            if (instance) {
                setFrappeInstance(instance)
                updateCurrentUser(instance)
            }
        }

        tryGetInstance()
    }, [])

    async function logoutUser() {
        frappeInstance?.logoutUser()
    }

    async function updateCurrentUser(instance: FrappeClient) {
        const data = await instance.updateUser()
        if (data) {
            setCurrentUser(data)
        }
    }

    return { currentUser, logoutUser }
}
