/**
 * npm run pre:quest -- https://github.com/5208980/pol-template/
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { validateQuest } from "../lib/utils";

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`Expected 1 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const uri = args[0];

(async () => {
    try {
        console.log(`Validating Repo ${uri} ...`)
        const data = await validateQuest(uri)
        console.log(`Repo is valid`)
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1); // Exit with code 1 to indicate failure
    }
})()