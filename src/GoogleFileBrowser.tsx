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
            setFilesError(error.message)
        } finally {
            setLoadingFiles(false)
        }
    }

    return (
        <div className="flex flex-col gap-2 mt-3 border-t border-gray-200 pt-3">
            <div className="flex flex-col items-center justify-between gap-2">
                {user
                    ? <span className="text-xs text-gray-500 truncate" title={user.displayName}>Signed in as <strong>{user.displayName}</strong></span>
                    : <span className="text-xs text-gray-400">Not connected</span>
                }
                <div className="flex gap-1 shrink-0">
                    <button
                        onClick={login}
                        disabled={!!user || loading}
                        className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >Connect
                    </button>
                    <button
                        onClick={logout}
                        className="px-2 py-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >Sign out
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>
            )}

            {user && (
                <button
                    onClick={fetchFiles}
                    disabled={loadingFiles}
                    className="w-full px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loadingFiles ? 'Loading…' : 'Browse Google Sheets'}
                </button>
            )}

            {filesError && (
                <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{filesError}</p>
            )}

            {selectedFile && (
                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                    <span>📄</span>
                    <span className="font-medium truncate">{selectedFile.name}</span>
                </div>
            )}

            {files.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                        Your Google Sheets
                    </p>
                    <ul className="max-h-28 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded">
                        {files.map((file) => (
                            <li key={file.id}>
                                <button
                                    onClick={() => onSelectFileClick(file)}
                                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 truncate"
                                >
                                    {file.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export {GoogleFileBrowser}
export type {DriveFile}
