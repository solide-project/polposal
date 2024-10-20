/**
 * npm run post:poap -- https://github.com/5208980/pol-template/
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { uploadToIPFS } from "../lib/chains/pinata"
import {
    retrievePoapImage,
    retrievePoapMetadata
} from '../lib/utils';
import { privateKeyToAccount } from 'viem/accounts';
import { getClient, getWalletClient } from '../lib/chains/ether';
import { openCampusCodex } from '../lib/chains/open-campus-codex';
import { parseAbi } from 'viem';

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`Expected 1 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const uri = args[0];
const chain = openCampusCodex.id;

(async () => {
    try {
        // Upload Poap Image
        const blob = await retrievePoapImage(uri)
        const imgUpload = await uploadToIPFS({
            data: blob, group: "images"
        })
        console.log("Image Uploaded: ", imgUpload.IpfsHash)

        if (!imgUpload.IpfsHash)
            throw new Error("Couldn't found IPFS CID for image")

        // Get metadata and attach image
        const metadata = await retrievePoapMetadata(uri)
        if (!metadata.image) {
            console.warn(`Replacing metadata image, ${imgUpload.IpfsHash}`)
            metadata.image = `ipfs://${imgUpload.IpfsHash}`
        }
        // console.log("Metadata: ", metadata)

        // Upload final metadata
        const upload = await uploadToIPFS({
            data: blob, group: "images"
        })
        console.log("Metadata Uploaded: ", upload.IpfsHash)

        // Store on chain
        const account = privateKeyToAccount(process.env.MINTER_SK as `0x${string}`)

        // Get the latest token minted and increment by one
        const publicClient = getClient(chain);
        const tokens = await publicClient.readContract({
            account,
            address: process.env.POAP_CONTRACT as `0x${string}`,
            abi: parseAbi(["function getOwnedTokenIds(address account) external view returns (uint256[] memory)"]),
            functionName: 'getOwnedTokenIds',
            args: [account.address]
        })
        const tokenId = tokens.reduce((max, current) => current > max ? current : max) + 1n;;

        // Mint to main account
        console.log(`Minting ${tokenId.toString()} ...`)
        const client = getWalletClient(chain);
        const hash = await client.writeContract({
            account,
            address: process.env.POAP_CONTRACT as `0x${string}`,
            abi: parseAbi(['function mint(address to, uint256 id, bytes memory data) nonpayable']),
            functionName: 'mint',
            args: [account.address, tokenId, "0x"]
        })
        console.log("Minted: ", hash)
    } catch (e: any) {
        console.log(e)
        process.exit(1);
    }
})()