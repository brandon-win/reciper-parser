import {useState, useCallback, useEffect} from 'react'

const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        setLoading(true)
        try {
            const {
                success, 
                error, 
                user
            } = await chrome.runtime.sendMessage({action: 'GET_USER'})
            
            if (success) {
                setUser(user)
            } else {
                throw new Error(error)
            }
            
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const login = useCallback(async () => {
        setLoading(true)
        try {
            const {
                success, 
                user, 
                error
            } = await chrome.runtime.sendMessage({action: 'SIGN_IN'})
            
            if (success) {
                setUser(user)
            } else {
                throw new Error(error)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        setLoading(true)
        try {
            const {
                success, 
                error
            } = await chrome.runtime.sendMessage({action: 'SIGN_OUT'})         

            if (success) {
                setUser(null)
            } else {
                throw new Error(error)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        user,
        login,
        logout,
        loading,
        error,
    }
}

export {useAuth}