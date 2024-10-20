/**
 * Consideration
 * - not time validitity checks, meaning a single transaction can be used multiple times
 * - anyone transaction that is valid can be used
 *      meaning that someone who does own the transaction can use it and it'll still be valid
 * 
 * Actions
 * - Store these transaction in db for 
 * 
 * npm run pre:stake -- 0x4063c791ad27c649b612231d60a264ac286bf4f4aad85cc8a1fd0622c0c22f8e
 */
import * as dotenv from 'dotenv';
dotenv.config();

import {
    getClient,
    isCorrectAddress,
    isSufficient
} from '../lib/chains/ether';
import { openCampusCodex } from '../lib/chains/open-campus-codex';

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`Expected 1 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const hash = args[0] as `0x${string}`;
// Will change to handle test/main net
const chain = openCampusCodex.id;

(async () => {
    try {
        const client = getClient(chain);

        const chainId = await client.getChainId();
        console.log("Chain: ", chainId);

        const transaction = await client.getTransaction({ hash });
        console.log("Block Number: ", transaction.blockNumber);

        if (!isSufficient(transaction)) {
            console.error("Invalid staking amount");
            process.exit(1);
        }

        if (!isCorrectAddress(transaction, chainId.toString())) {
            console.error("Invalid staking address");
            process.exit(1);
        }

        // If all validations pass
        console.log("Validation successful!");
        process.exit(0);

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
})()