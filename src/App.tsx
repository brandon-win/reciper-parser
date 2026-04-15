import React from 'react'
import {UrlParser} from './UrlParser'
import { AuthProvider } from './contexts/AuthContext.tsx'

const App: React.FC = () => {
    return (
        <section className='container'>
            <h1>Recipe browser</h1>   
            <UrlParser />
        </section>
    )
}

const AppWithAuth = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
)

export default AppWithAuth