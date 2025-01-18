/**
 * npm run post:poap -- https://github.com/5208980/pol-template/
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { uploadJSONToIPFS, uploadToIPFS } from "../lib/core/pinata"
import {
    retrievePoapImage,
    retrievePoapMetadata
} from '../lib/utils';
import { getClient, getWalletClient } from '../lib/core/viem';
import { getContractAddress } from '../lib/poap';
import { parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Handle Arguments
var args = process.argv.slice(2);

if (args.length !== 2) {
    console.error(`Expected 1 argument but received ${args.length}. Usage: node script.js hash`);
    process.exit(1);
}

const uri = args[0];

const chain = process.env.CHAINID
if (!chain) {
    console.error(`Invalid Chain ID`);
    process.exit(1);
}

const contractAddress = getContractAddress(chain);

console.log(`Env: ${chain}`);
console.log(`Contract: ${contractAddress}`);

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
        const upload = await uploadJSONToIPFS({
            data: metadata
        })
        console.log("Metadata Uploaded: ", upload.IpfsHash)

        // Store on chain
        const account = privateKeyToAccount(process.env.MINTER_SK as `0x${string}`)

        // Get the latest token minted and increment by one
        const tokenId = BigInt(args[1]);
        const publicClient = getClient(Number(chain));
        const client = getWalletClient(account, Number(chain));

        // const tokens = await publicClient.readContract({
        //     account,
        //     address: contractAddress as `0x${string}`,
        //     abi: parseAbi(["function getOwnedTokenIds(address account) external view returns (uint256[] memory)"]),
        //     functionName: 'getOwnedTokenIds',
        //     args: [account.address]
        // })

        // console.log(tokens)
        // let tokenId = 0n;
        // if (tokens.length > 0) {
        //     tokenId = tokens.reduce((max, current) => current > max ? current : max) + 1n;
        // }

        // Mint to main account
        // console.log(`Minting ${tokenId.toString()} ...`)
        // const encodedMessage = keccak256(encodePacked(['address', 'uint256'], [account.address, BigInt(tokenId)]));
        // const message = toBytes(encodedMessage);

        // const signature = await client.signMessage({
        //     message: { raw: message },
        // });

        // const hash = await client.writeContract({
        //     account,
        //     address: contractAddress as `0x${string}`,
        //     abi: parseAbi(['function mint(address account, uint256 id, bytes memory data, string memory verification, bytes memory signature) nonpayable']),
        //     functionName: 'mint',
        //     args: [account.address, tokenId, "0x", "", signature]
        // })
        // console.log("Minted: ", hash)

        // Add metadata
        console.log(`Adding metadata ${upload.IpfsHash} to ${tokenId.toString()} ...`)
        const metadataHash = await client.writeContract({
            account,
            address: contractAddress as `0x${string}`,
            abi: parseAbi(['function setURI(uint256 id, string memory newURI) external']),
            functionName: 'setURI',
            args: [tokenId, `ipfs://${upload.IpfsHash}`]
        })
        console.log("Uri: ", metadataHash)
    } catch (e: any) {
        console.log(e)
        process.exit(1);
    }
})()