interface RecipeMetaData {
    recipeName: string
    link: string
    category?: string
    cuisine?: string
}

interface DriveFile {
    id: string
    name: string
}

export type {
    RecipeMetaData,
    DriveFile
}