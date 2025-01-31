/**
 * Consideration
 * - Need to store POL POAP metadata somewhere
 *      Requirements
 * npm run post:store -- https://github.com/5208980/pol-template/
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { convertImportToMongo } from "../lib/polearn/core/src/converter";
import { getConnectionString } from "../lib/core/mongo-service";
import { Course } from "../lib/db/course";
import { validateQuest } from "../lib/utils";
import { POLMongo } from '../lib/db/client';

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 2) {
    console.error(`Expected 2 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const uri = args[0];

/**
 * IMPORTANT: Currently token ID, is manually added
 */
const tokenId = args[1];

const chain = process.env.CHAINID
if (!chain) {
    console.error(`Invalid Chain ID`);
    process.exit(1);
}

const connectionString = getConnectionString(Number(chain)) || "";

console.log(`Env: ${chain}`);
console.log(`ConnecionStrng: ${connectionString.slice(0, 15)}...`);

(async () => {
    const service = new POLMongo({
        connectionString: connectionString,
        database: process.env.DB_NAME || "",
        collections: {
            submission: process.env.SUBMISSION_COLLECTION_NAME || "",
            userSubmission: process.env.USER_SUBMISSION_COLLECTION_NAME || "",
            course: process.env.QUEST_COLLECTION_NAME || "",
            user: process.env.QUEST_USER_NAME || "",
        }
    });
    await service.connect();

    try {
        const data = await validateQuest(uri)
        console.log("Quest is valid")

        // Initialise quest metadata
        const token = parseInt(tokenId)
        if (!token) {
            if (token !== 0) {  // Edge case
                throw new Error("Invalid token")
            }
        }
        const metadata: Course = {
            owner: data.metadata.owner,
            name: data.metadata.name,
            title: data.metadata.title,
            image: data.metadata.image,
            description: data.metadata.description,
            tokenId: token,
            quests: []
        }

        if (data.metadata.type) {
            metadata.type = data.metadata.type
        }

        // Quest 
        const quests = convertImportToMongo(data)
        console.log(`Total Quest: ${quests.length}`)

        const questIds = quests.map((item) => item.id);
        metadata.quests = questIds;
        const query = { id: { $in: questIds } };
        const existings = await service.submissions?.find(query);
        // if (existings?.length !== 0) throw new Error("Failed to find existing submissions");

        // Storing metadata since we populate its quests
        console.log("Storing metadata ...")
        await service.courses?.insert(metadata)
        console.log("Metadata stored successfully!")

        // // Finally store all quest generated
        // console.log("Storing quests ...")
        for (const quest of quests) {
            console.log(`Storing quest: ${quest.path} ${quest.id}`)
            await service.submissions?.insert(quest)
        }

        console.log("Quests stored successfully!")
    } catch (error) {
        // Need to delete all inserted entry somehow ... 
        // but need to take into account validation throws

        console.error("Error:", error.message);
        process.exit(1); // Exit with code 1 to indicate failure
    } finally {
        await service.disconnect()
    }
})()