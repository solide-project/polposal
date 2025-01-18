import { hashMessage } from "viem"
import GitUrlParse from "git-url-parse";

import { isJSON } from "./utils"
import path from "path";

/**
 * Method to generate Quest id for a given Github URL
 * For example a quest for this content,
 * https://github.com/POLearn/pol-template/blob/master/content/01_deploy_your_first_token/05_deploy/README.md
 * 
 * Will be converted
 * polearn/pol-template/content/01_deploy_your_first_token/05_deploy/README.md
 * 
 * Note that it the README.md is include to validate the quest
 * the path should be lowercase except for the README.md
 */
export const generateQuestId = (uri: string): string => {
    const parsed = GitUrlParse(uri)
    const questPath = path.join(parsed.full_name.toLowerCase(), parsed.filepath.toLowerCase())
    // Hacky method but it should be like this
    const correctedPath = questPath.replace(/readme\.md$/i, 'README.md');

    return hashMessage(correctedPath.replace(/\\/g, "/"))
}

/**
 * Hashes value. This can string value like an address or byte 
 * which will require double quotes.
 * Objects and strings can just be incase as a JSON object.
 * @param value 
 * @returns 
 */
export const generateDataHash = (value: string) => {
    if (!isJSON(value)) {
        throw Error("Parsing error")
    }

    return hashMessage(JSON.stringify(JSON.parse(value)))
}

/**
 * Hashes value. This can string value like an address or byte 
 * which will require double quotes.
 * Objects and strings can just be incase as a JSON object.
 * @param value 
 * @returns 
 */
export const generateDataHashFromContract = (value: any) => {
    const obj = JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    return hashMessage(obj);
}