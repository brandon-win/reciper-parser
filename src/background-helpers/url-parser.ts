    import type {RecipeMetaData} from "../types";

    const normalizeMetadataField = (category?: string | string[]) => {
        if (Array.isArray(category)) {
            return category.join('-')
        }

        if (typeof category === 'string') {
            return category
        }

        return ''
    }

    const getWebsiteInfo = async ({body, link}) => {
        if (!body || typeof body !== 'string') {
            throw new Error('Invalid body: expected a non-empty string')
        }

        if (!link || typeof link !== 'string') {
            throw new Error('Invalid link: expected a non-empty string')
        }

        let metadata: Record<string, unknown>;
        try {
            metadata = JSON.parse(body);
        } catch {
            throw new Error('Invalid body: could not parse JSON')
        }

        const obj = metadata["@graph"]

        if (!Array.isArray(obj)) {
            throw new Error('Invalid metadata: missing or malformed @graph array')
        }

        const graph = obj as Record<string, unknown>[]
        const recipeObject = graph.find((ele) => ele["@type"] === "Recipe")

        if (!recipeObject) {
            throw new Error('No recipe metadata found')
        }

        if (!recipeObject.name) {
            throw new Error('Recipe metadata is missing a name')
        }
        
        const recipe = {
            recipeName: recipeObject.name,
            cuisine: normalizeMetadataField(recipeObject.recipeCuisine as string | string[]),
            category: normalizeMetadataField(recipeObject.recipeCategory as string | string[]),
            link
        } as RecipeMetaData
        console.log('returned recipe', recipe)
        return recipe
    }

    export {getWebsiteInfo}
