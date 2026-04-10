import {useState} from 'react'
import {useGoogle} from './useGoogle.ts'


const GoogleFileBrowser = () => {  
        const [files, setFiles] = useState([])

        const {        
            token,
            getUserAuthToken,
            logout,
            loading,
            error,
    } = useGoogle()
    
    if (!token) {
        return (
            <button onClick={getUserAuthToken} disabled={loading}>
                Connect Google Drive
            </button>
        )
    }

    return (
        <>
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