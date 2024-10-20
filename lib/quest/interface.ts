export interface QuestTitle {
    id: string
    number: number
    title: string
    name: string
    path: string
    // This is optional and will be useful for the playground
    playground?: string
}

export interface QuestStructure {
    [key: string]: QuestStructureItem
}

export interface QuestStructureItem {
    name: QuestTitle,
    children?: QuestStructure
}