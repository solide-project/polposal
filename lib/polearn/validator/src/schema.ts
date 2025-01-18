export const $schema: any = {
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
            "required": ["owner", "name", "title", "image", "description"]
        },
        quests: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    type: { type: "string", enum: ["deployment", "transaction", "value", "data"] },
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
                else: {
                    if: {
                        properties: { type: { const: "transaction" } }
                    },
                    then: {
                        required: ["abi"]
                    }
                }
            }
        }
    },
    required: ["metadata", "quests"],
};
