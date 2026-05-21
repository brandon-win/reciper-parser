import React, {useState} from 'react'
import {UrlParser} from './UrlParser'
import { AuthProvider } from './contexts/AuthContext.tsx'
import {GoogleFileBrowser} from './GoogleFileBrowser'
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
    
    const getWebsiteInfo = async () => {
        const {data} = await chrome.runtime.sendMessage({action: 'PARSE_SITE'})
        setMetadata(data)
    }

    const selectAndCacheFileData = (file) => {
        setSelectedFile(file)
        localStorage.setItem(LOCALSTORAGE_FILE_KEY, file)
    }

    return (
        <section className='container'>
            <h1>Recipe browser</h1>   
            <UrlParser 
                metadata={metadata}
                onGetRecipeButtonClick={getWebsiteInfo}
            />
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