import { getInstanceManager } from ".."
import { useEffect, useState } from 'react'
export const useAuth = () => {
    const instance = getInstanceManager()
    const [currentUser, setCurrentUser] = useState()
    useEffect(() => {
        if (instance) {
            updateCurrentUser()
        }
    }, [instance])
    async function logoutUser() {
        instance.logoutUser()
    }
    async function updateCurrentUser() {
        const data = await instance.updateUser()
        if (data) {
            setCurrentUser(data)
        }

    }
    return { currentUser, logoutUser }
}