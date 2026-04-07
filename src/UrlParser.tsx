import React, {useState, useEffect} from 'react';


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
        const res = await fetch(link)
        const text = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
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

    const onUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value)
    }

    const onButtonClick = async (link: string) => {
        await getWebsiteInfo(link)
    }

    return (
        <>
            {/* <input 
                value={url} 
                placeholder="Add a URL!" 
                onChange={onUrlInputChange}
            /> */}
            <button onClick={() => onButtonClick(url)}>Get Recipe Metadata</button>

            <ul>
                <li>Recipe Name: {metadata.recipeName}</li>
                <li>Cuisine: {metadata.cuisine}</li>
                <li>Category: {metadata.category}</li>
                <li>Link: {metadata.link}</li>

            </ul>
        </>
    )

}

export {
    UrlParser
}