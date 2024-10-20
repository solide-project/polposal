import { Deployment, Transaction } from "../db/submission"
import { generateQuestId } from "./utils"
import { QuestImport } from "./validate"

export const convertImportToMongo = (data: QuestImport) => {
    const submissionItems: (Deployment | Transaction)[] = []
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