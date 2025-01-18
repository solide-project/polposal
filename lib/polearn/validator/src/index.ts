import Ajv from "ajv";
import { $schema } from "./schema";
import { SubmissionType } from "../../core";
import { QuestConfiguration } from "../../core";

export const validate = (value: string): QuestConfiguration => {
    const data = JSON.parse(value) as QuestConfiguration

    const schema = $schema;

    // Validate the data
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    // Throw an error if the data is invalid
    if (!valid) throw new Error(validate.errors?.map((error) => error.message).join("\n"))
    if (hasDuplicatePaths(data.quests)) throw new Error("Duplicate paths found. Paths must be unique for each quest.")

    return data
}

const hasDuplicatePaths = (quests: SubmissionType[]): boolean => {
    const pathsSeen = new Set<string>();

    for (const quest of quests) {
        if (pathsSeen.has(quest.path)) {
            return true; // Duplicate found
        }
        pathsSeen.add(quest.path);
    }

    return false; // No duplicates
}