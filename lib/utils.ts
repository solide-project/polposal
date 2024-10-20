import { execSync } from "child_process";
import GitUrlParse from "git-url-parse";
import { validate } from "./quest/validate";

export const retrieveQuest = async (uri: string) => {
    const parsed = GitUrlParse(uri, [])
    if (!parsed.owner || !parsed.name)
        throw new Error("Invalid Github Repo")

    const config = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.name}/refs/heads/master/quest.config.json`
    const response = await fetch(config)
    return response.json()
}

export const retrievePoapImage = async (uri: string) => {
    const parsed = GitUrlParse(uri, [])
    if (!parsed.owner || !parsed.name)
        throw new Error("Invalid Github Repo")

    const config = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.name}/refs/heads/master/poap/image.png`
    const response = await fetch(config)
    return response.blob()
}

export const retrievePoapMetadata = async (uri: string) => {
    const parsed = GitUrlParse(uri, [])
    if (!parsed.owner || !parsed.name)
        throw new Error("Invalid Github Repo")

    const config = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.name}/refs/heads/master/poap/metadata.json`
    const response = await fetch(config)
    return response.json()
}

export const validateQuest = async (uri: string) => {
    const config = await retrieveQuest(uri)
    return validate(JSON.stringify(config))
}

export const runCommand = (command: string): boolean => {
    try {
        execSync(command, { stdio: "inherit" });  // 'inherit' will show output to the console in real time
        return true;
    } catch (error: any) {
        console.error(`Failed to execute command: ${command}`);
        console.error(`Error: ${error.message}`);
        return false;
    }
};