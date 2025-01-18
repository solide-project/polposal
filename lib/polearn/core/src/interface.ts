import { SubmissionType } from "./submission/interface"

export interface QuestConfiguration {
    metadata: {
        owner: string
        name: string
        chain: string
        title: string
        image: string
        description: string
    },
    quests: SubmissionType[]
}