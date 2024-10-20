import Ajv from "ajv";

export interface QuestItem {
    path: string
    id: string
    chain: string
    type: "deployment" | "transaction"
    description?: string
}

/**
 * This should be the same as Deployment
 */
export interface QuestDeploymentItem extends QuestItem {
    type: "deployment"
    bytecode: string // Note this is a sha256 of the bytecode
}

/**
 * This should be the same as Transaction
 */
export interface QuestTransactionItem extends QuestItem {
    type: "transaction"
    abi: string[]
    contract?: string
    args: any[]
}

export interface QuestImport {
    metadata: {
        owner: string
        name: string
        chain: string
        title: string
        image: string
        description: string
    },
    quests: (QuestDeploymentItem | QuestTransactionItem)[]
}

const hasDuplicatePaths = (quests: (QuestDeploymentItem | QuestTransactionItem)[]): boolean => {
    const pathsSeen = new Set<string>();

    for (const quest of quests) {
        if (pathsSeen.has(quest.path)) {
            return true; // Duplicate found
        }
        pathsSeen.add(quest.path);
    }

    return false; // No duplicates
}

export const validate = (value: string): QuestImport => {
    const data = JSON.parse(value) as QuestImport

    const schema = {
        type: 'object',
        properties: {
            metadata: {
                type: "object",
                properties: {
                    owner: { type: "string" },
                    name: { type: "string" },
                    chain: { type: "string", "pattern": "^[0-9]+$" },
                    title: { type: "string" },
                    image: { type: "string" },
                    description: { type: "string" },

                },
                "required": ["owner", "name", "chain", "title", "image", "description"]
            },
            quests: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        path: { type: "string" },
                        type: { type: "string", enum: ["deployment", "transaction"] },
                        chain: { type: "string" },
                        bytecode: { type: "string" },
                        contract: { type: "string" }
                    },
                    required: ["path", "type"],
                    if: {
                        properties: { type: { const: "deployment" } }
                    },
                    then: {
                        required: ["bytecode"]
                    },
                }
            }
        },
        required: ["metadata", "quests"],
    };

    // Validate the data
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    // Throw an error if the data is invalid
    if (!valid) throw new Error(validate.errors?.map((error) => error.message).join("\n"))
    if (hasDuplicatePaths(data.quests)) throw new Error("Duplicate paths found. Paths must be unique for each quest.")

    return data
}