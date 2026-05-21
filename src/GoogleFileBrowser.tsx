import React, {useState} from 'react'
import {useAuthContext} from './contexts/AuthContext'
import type {DriveFile} from './types'

interface FileBrowser {
    selectedFile: DriveFile
    onSelectFileClick: (file: DriveFile) => void
}

const GoogleFileBrowser: React.FC<FileBrowser> = ({
    selectedFile, onSelectFileClick 
}) => {
    const [files, setFiles] = useState<DriveFile[]>([])
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [filesError, setFilesError] = useState<string | null>(null)
    const {user, login, loading, error, logout} = useAuthContext()

    const fetchFiles = async () => {
        setLoadingFiles(true)
        setFilesError(null)

        try {
            const response = await chrome.runtime.sendMessage({ action: "LIST_DRIVE_FILES" })
            setLoadingFiles(false)
            if (response.success) {
                setFiles(response.files)
                return
            } 

            throw new Error(response.error)
        } catch (error) {
            setFilesError(error)
        } finally {
            setLoadingFiles(false)
        }
    }

    return (
        <>
            <button onClick={login} disabled={!!user || loading}>
                Connect Google Account
            </button>
            <button onClick={logout}>Sign Out</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {user && (
                <>
                    <h3>Welcome, {user.displayName}</h3>
                    <button onClick={fetchFiles} disabled={loadingFiles}>
                        {loadingFiles ? 'Loading...' : 'Browse Google Sheets'}
                    </button>
                </>
            )}
            {filesError && <p style={{color: 'red'}}>{filesError}</p>}
            {selectedFile && <p>Selected: <strong>{selectedFile.name}</strong></p>}
            {files.length > 0 && (
                <>
                    <h3>Your Google Sheets</h3>
                    <ul>
                        {files.map((file) => (
                            <li key={file.id}>
                                <button onClick={() => onSelectFileClick(file)}>
                                    {file.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    )
}

export {GoogleFileBrowser}
export type {DriveFile}
