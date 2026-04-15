/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext} from 'react'
import {useAuth} from '../hooks/useAuth'

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null)

const AuthProvider = ({children}) => {
    const auth = useAuth()

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuthContext = () => useContext(AuthContext)

export {
    AuthProvider,
    useAuthContext,
}