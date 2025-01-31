import { POLMongo, POLMongoConfig } from "../db/client";

import * as dotenv from 'dotenv';
import { eduChain, eduChainTestnet } from "../poap/chain";
dotenv.config();

export const defaultConfig: POLMongoConfig = {
    connectionString: process.env.MONGO_URI || "",
    database: process.env.DB_NAME || "",
    collections: {
        submission: process.env.SUBMISSION_COLLECTION_NAME || "",
        userSubmission: process.env.USER_SUBMISSION_COLLECTION_NAME || "",
        course: process.env.QUEST_COLLECTION_NAME || "",
        user: process.env.QUEST_USER_NAME || "",
    }
}

export class POLMongoService extends POLMongo {
    constructor() {
        super(defaultConfig)
    }
}

export const getConnectionString = (chainId: number) => {
    switch (chainId) {
        case eduChain.id:
            return process.env.MONGO_URI_PROD;
        case eduChainTestnet.id:
            return process.env.MONGO_URI_TEST;
        default:
            throw new Error("Unset Mongo")
    }
}