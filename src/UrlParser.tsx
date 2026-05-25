import React from 'react'
import type {RecipeMetaData} from './types'


interface IUrlParser {
    metadata: RecipeMetaData
    onGetRecipeButtonClick: () => void
}

const UrlParser: React.FC<IUrlParser> = ({metadata, onGetRecipeButtonClick}) => {
    return (
        <>
            <button onClick={onGetRecipeButtonClick}>Get Recipe Metadata</button>
            <ul>
                <li>Recipe Name: {metadata?.recipeName}</li>
                <li>Cuisine: {metadata?.cuisine}</li>
                <li>Category: {metadata?.category}</li>
                <li>Link: {metadata?.link}</li>
            </ul>
        </>
    )

}

export {
    UrlParser
}