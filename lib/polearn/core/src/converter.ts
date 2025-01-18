import { QuestConfiguration } from "./interface"
import { generateQuestId } from "./main"
import { SubmissionType } from "./submission/interface"

export const convertImportToMongo = (data: QuestConfiguration) => {
    const submissionItems: SubmissionType[] = []
    const githubUri = "https://github.com"
    const repoUri = `${githubUri}/${data.metadata.owner}/${data.metadata.name}`
    data.quests.forEach((quest) => {
        const questPath = `${repoUri}/blob/master/content/${quest.path}/README.md`
        const questId = generateQuestId(questPath)

        const item = {
            ...quest,
            id: questId,
            chain: data.metadata.chain,
            type: quest.type,
        }

        // These quest items have precedence
        if (quest.chain) {
            item.chain = quest.chain
        }

        submissionItems.push(item as any)
    })

    return submissionItems
}