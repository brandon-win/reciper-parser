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
        const metadata = JSON.parse(body);
        const obj = metadata["@graph"]
        const recipeObject = obj.find((ele) => ele["@type"] === "Recipe")
        const recipe = {
            recipeName: recipeObject?.name,
            cuisine: normalizeMetadataField(recipeObject?.recipeCuisine),
            category: normalizeMetadataField(recipeObject?.recipeCategory),
            link
        } as RecipeMetaData

        return recipe
    }

    export {getWebsiteInfo}
