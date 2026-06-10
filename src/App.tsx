import React, {useState} from 'react'
import {UrlParser} from './UrlParser'
import { AuthProvider } from './contexts/AuthContext.tsx'
import {GoogleFileBrowser} from './GoogleFileBrowser.tsx'
import type {RecipeMetaData, DriveFile} from './types'

const LOCALSTORAGE_FILE_KEY = 'GoogleSheetOutputFile'

const initialMetadata: RecipeMetaData = {
    recipeName: '',
    cuisine: '',
    category: '',
    link: '',
} as const

const App: React.FC = () => {
    const [metadata, setMetadata] = useState<RecipeMetaData>(initialMetadata)
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(
        JSON.parse(localStorage.getItem(LOCALSTORAGE_FILE_KEY)) ?? null
    )
    const [error, setError] = useState<string | null>(null)
    
    const getWebsiteInfo = async () => {

        try {
            const {success, data} = await chrome.runtime.sendMessage({action: 'PARSE_SITE'})
            if (!success) {
                throw new Error('Failed to parse website metadata')
            }

            setMetadata(data)
        } catch (error) {
            setError(error.message)
        }
    }

    const selectAndCacheFileData = (file) => {
        setSelectedFile(file)
        localStorage.setItem(LOCALSTORAGE_FILE_KEY, JSON.stringify(file))
    }

    const appendSelectedFileWithMetadata = async (
        file: DriveFile, metadata: RecipeMetaData
    ) => {
        setError(null)
        try {
            if (!metadata.link) {
                throw new Error('You must have a URL in the metadata to submit to a sheet')
            }

            const response = await chrome.runtime.sendMessage({ 
                action: "APPEND_TO_SHEET",
                spreadsheetId: file.id,
                metadata
            })
            if (!response.success) {
                throw new Error(response.error)
            }
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <section className='container p-2'>
            <h1>Recipe browser</h1>   
            <UrlParser 
                metadata={metadata}
                onGetRecipeButtonClick={getWebsiteInfo}
            />
            {selectedFile &&
                <button
                    onClick={() => appendSelectedFileWithMetadata(selectedFile, metadata)}
                    className="w-full px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 truncate"
                >Append to {selectedFile.name}
                </button>
            }
            {!!error && <div className='error'>{error}</div>}
            <GoogleFileBrowser 
                selectedFile={selectedFile}
                onSelectFileClick={selectAndCacheFileData}
            />     
        </section>
    )
}

const AppWithAuth = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
)

export default AppWithAuth