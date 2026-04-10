import {useState, useCallback} from 'react'


const useGoogle = () => {
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const getUserAuthToken = useCallback(async () => {
        setLoading(true)
        try {
            const res = await chrome.runtime.sendMessage({action: 'getAuthToken'})
            if (res.error) {
                throw new Error(res.error)
            }

            if (!res.token) {
                throw new Error('Failed to get auth token')
            }

            setToken(token)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])


    const logout = useCallback(() => {
        if (!token) {
            return
        }

        const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
        fetch(url);

        chrome.identity.removeCachedAuthToken({ token }, () => {
            setToken(null);
        });
    }, [token])

    return {
        token,
        getUserAuthToken,
        logout,
        loading,
        error,
    }
}

export {useGoogle}