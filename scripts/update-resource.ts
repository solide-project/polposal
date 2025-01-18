/**
 * Consideration
 * - Need to store POL POAP metadata somewhere
 *      Requirements
 * npm run post:update -- https://github.com/5208980/pol-template/
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { convertImportToMongo } from "../lib/polearn/core/src/converter";
import { Course } from "../lib/db/course";
import { validateQuest } from "../lib/utils";
import { POLMongo } from '../lib/db/client';
import { getConnectionString } from '../lib/core/mongo-service';
import { Collection } from 'mongodb';

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`Expected 2 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const uri = args[0];

const chain = process.env.CHAINID
if (!chain) {
    console.error(`Invalid Chain ID`);
    process.exit(1);
}

const connectionString = getConnectionString(Number(chain)) || "";

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
        // found existing resource
        const data = await validateQuest(uri)

        console.log("Quest is valid")

        const course = await service.courses?.getByRepo(data.metadata.owner, data.metadata.name)
        if (!course) throw new Error("Repository doesn't exist on POL");

        console.log(`Making sure there is a tokenID ${course.tokenId}`)

        // Initialise quest metadata
        const metadata: Course = {
            owner: data.metadata.owner,
            name: data.metadata.name,
            title: data.metadata.title,
            image: data.metadata.image,
            description: data.metadata.description,
            tokenId: course.tokenId,        // This is IMPORTANT
            quests: []
        }

        /**
         * Things to consider when updating quests
         * - Changing the path of content, will change id, meaning for old user submission, 
         * they will not have the new submission and may need to submit again
         * - The above applies for the users that completed the resource and minted their POAP,
         * this however, we can sorta disgard, as once their 
         * 
         * So update can occurs are,
         * - New quest - Addition of new quest, means new contents. This will not have side affects
         * - Updating exist quest - 
         * - Deleting quest - This is simply not including it in the quest.config.json, when it did before.
         * 
         * Current implementation of updating is, removing all the quest from course and then readding from
         * quest.config.json. This will invalidate all existing quests related to course and will have to resubmit
         */
        // Found all existing quest for resource and delete
        const oldQuery = { id: { $in: course.quests } };
        const oldQuests = await service.submissions?.find(oldQuery);
        const oldQuestsValue = await oldQuests?.toArray()

        if (oldQuestsValue?.length !== course.quests.length) {
            console.log("Missmatch of quests. This means the old quests are not align to resource quests for some reason.")
            console.log("Consider manually deletion ...")
            console.log(course.quests)
        }

        // Remove old quests
        const result = await service.submissions?.collection.deleteMany(oldQuery);
        console.log(result)

        // Quest 
        const quests = convertImportToMongo(data)
        console.log(`Total Quest: ${quests.length}`)

        const questIds = quests.map((item) => item.id);
        metadata.quests = questIds;
        const query = { id: { $in: questIds } };
        const existings = await service.submissions?.find(query);
        const exstingsValue = await existings?.toArray()
        if (exstingsValue?.length !== 0) throw new Error("Failed to find existing submissions");

        // Storing metadata since we populate its quests. Note this is an update
        // console.log("Storing metadata ...")
        await service.courses?.update((course as any)._id, metadata)
        // console.log("Metadata stored successfully!")

        // Finally store all quest generated
        console.log("Storing quests ...")
        for (const quest of quests) {
            console.log(`Storing quest: ${quest.path} ${quest.id}`)
            await service.submissions?.insert(quest)
        }

        console.log("Quests updated successfully!")
    } catch (error) {
        // Need to delete all inserted entry somehow ... 
        // but need to take into account validation throws

        console.error("Error:", error.message);
        process.exit(1); // Exit with code 1 to indicate failure
    } finally {
        await service.disconnect()
    }
})()