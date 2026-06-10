import React from 'react'
import type {RecipeMetaData} from './types'

interface IUrlParser {
    metadata: RecipeMetaData
    onGetRecipeButtonClick: () => void
}

const fields: { label: string; key: keyof RecipeMetaData }[] = [
    { label: 'Recipe Name', key: 'recipeName' },
    { label: 'Cuisine',     key: 'cuisine' },
    { label: 'Category',    key: 'category' },
    { label: 'Link',        key: 'link' },
]

const UrlParser: React.FC<IUrlParser> = ({metadata, onGetRecipeButtonClick}) => {
    return (
        <div className="flex flex-col gap-2 py-2">
            <dl className="divide-y divide-gray-100 border border-gray-200 rounded">
                {fields.map(({ label, key }) => (
                    <div key={key} className="flex items-baseline gap-2 px-2 py-1.5">
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 shrink-0">
                            {label}
                        </dt>
                        <dd className="text-xs text-gray-700 truncate">
                            {metadata?.[key] || <span className="text-gray-300">—</span>}
                        </dd>
                    </div>
                ))}
            </dl>
            <button
                onClick={onGetRecipeButtonClick}
                className="w-full px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Get Recipe Metadata
            </button>

        </div>
    )
}

export {
    UrlParser
}
