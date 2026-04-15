import {useState} from 'react'
import {useAuthContext} from './contexts/AuthContext'


const GoogleFileBrowser = () => {  
        const [files, setFiles] = useState([])
        const {user, login, loading, error, logout} = useAuthContext()
        console.log({error})
    return (
        <>
            <button onClick={login} disabled={user || loading}>
                Connect Google Account
            </button>
            <button onClick={logout}>Sign Out</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {user && (
                <h3>Welcome, {user.displayName}</h3>
            )}
            <h3>Recent Drive Files</h3>
            <ul>
                {files.map((file) => {
                    return (
                        <li key={file.id}>{file.name}</li>
                    )
                })}
            </ul>
        </>
    )
    

}

export {GoogleFileBrowser}