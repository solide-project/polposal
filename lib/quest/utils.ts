import { hashMessage } from "viem"
import { QuestStructure, QuestStructureItem, QuestTitle } from "./interface"
import path from "path";
import GitUrlParse from "git-url-parse";

export const parseTitle = (name: string): QuestTitle | null => {
    const match = name.match(/^(\d+)_([a-zA-Z_]+)$/);

    if (!match) {
        return null
    }

    const number = parseInt(match[1], 10);
    const title = match[2].replace(/_/g, ' ');

    return {
        number,
        title,
        name,
        path: "",
        id: ""
    };
}

export const joinUri = (...paths: string[]): string => {
    if (paths.length === 0) {
        return ""
    }

    paths = paths.map(path => path.replace(/^\/|\/$/g, ""))
    return paths.join("/")
}

export const generateQuestPath = (item: QuestTitle, owner: string, name: string, parent?: QuestTitle) => {
    const source = `https://github.com/${owner}/${name}/blob/master/content`
    const paths = [source]
    if (parent) paths.push(parent.name)
    paths.push(item.name)

    return joinUri(...paths)
}

// Generate a unique id for the quest. This should be used to identify the quest
// Example: owner/repo/path/to/quest/README.md 
// Important to include the README.md as it will be used to validate the quest
export const generateQuestId = (uri: string): string => {
    const parsed = GitUrlParse(uri)
    const questPath = path.join(parsed.full_name, parsed.filepath)
    return hashMessage(questPath.replace(/\\/g, "/"))
}

export const generateQuestIdByQuestStructureItem = (item: QuestStructureItem): string => {
    const content = joinUri(item.name.path, "README.md")
    return generateQuestId(content)
}

export const flatten = (data: QuestStructure): { id: string, name: QuestTitle }[] => {
    let result: { id: string, name: QuestTitle }[] = []

    sortStringNumbers(Object.keys(data)).forEach(key => {
        const item = data[key]
        result.push({ id: item.name.id, name: item.name })
        if (item.children) {
            result = result.concat(flatten(item.children))
        }
    })

    return result
}

function sortStringNumbers(arr: string[]): string[] {
    return arr.sort((a, b) => {
        return parseFloat(a) - parseFloat(b);
    });
}

export const mask = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
