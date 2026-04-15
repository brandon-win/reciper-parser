import React, {useState, useEffect} from 'react'
import {GoogleFileBrowser} from './GoogleFileBrowser'

interface RecipeMetaData {
    recipeName: string
    link: string
    category?: string
    cuisine?: string
}

const initialMetadata: RecipeMetaData = {
    recipeName: '',
    cuisine: '',
    category: '',
    link: '',


} as const

const UrlParser: React.FC = () => {
    const [metadata, setMetadata] = useState<RecipeMetaData>(initialMetadata)
    const [url, setUrl] = useState<string>('')

    useEffect(() => {
        const queryOptions = { active: true, currentWindow: true };
        chrome.tabs.query(queryOptions, (tabs) => {
            if (tabs[0]?.url) {
                setUrl(tabs[0].url);
            }
        });
    }, []);

    const normalizeMetadataField = (category?: string | string[]) => {
        if (Array.isArray(category)) {
            return category.join('-')
        }

        if (typeof category === 'string') {
            return category
        }

        return ''
    }

    const getWebsiteInfo = async (link) => {
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        console.log({jsonLdScript})
        const metadata = JSON.parse(jsonLdScript?.innerText);
        const obj = metadata["@graph"]
        const recipeObject = obj.find((ele) => ele["@type"] === "Recipe")
        const recipe = {
            recipeName: recipeObject?.name,
            cuisine: normalizeMetadataField(recipeObject?.recipeCuisine),
            category: normalizeMetadataField(recipeObject?.recipeCategory),
            link
        } as RecipeMetaData
        setMetadata(recipe)
    }

    const onButtonClick = async (link: string) => {
        await getWebsiteInfo(link)
    }

    return (
        <>
            <button onClick={() => onButtonClick(url)}>Get Recipe Metadata</button>
            <ul>
                <li>Recipe Name: {metadata.recipeName}</li>
                <li>Cuisine: {metadata.cuisine}</li>
                <li>Category: {metadata.category}</li>
                <li>Link: {metadata.link}</li>
            </ul>
            <GoogleFileBrowser />
        </>
    )

}

export {
    UrlParser
}