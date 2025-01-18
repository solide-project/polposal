import { PublicClient, WalletClient, createPublicClient, http, Account, Abi } from "viem";
import { abi } from "./abi";
import { getChain, getContractAddress, getRPC } from "./utils";
import { selectedNetwork } from ".";

interface POLPoapContractConfig {
    chain?: string
    wallet?: WalletClient
}

/**
 * Note when building, viem will throw Mismatch on totalSupply as there is overload function.
 * Use the one that accepts one argument.
 */
export class POLPoapContract {
    // contract: GetContractReturnType<typeof abi, PublicClient | WalletClient> = {} as any;
    contract: {
        address: `0x${string}`,
        abi: Abi,
    }
    chain: string = selectedNetwork.id.toString();

    publicClient: PublicClient;
    walletClient?: WalletClient;

    constructor({ wallet, chain = selectedNetwork.id.toString() }: POLPoapContractConfig) {
        const rpc = getRPC(chain)
        this.contract = {
            address: getContractAddress(chain),
            abi: abi,
        }
        this.chain = chain
        this.publicClient = createPublicClient({
            transport: http(rpc),
        })
        this.walletClient = wallet
    }

    private get contractParams() {
        return {
            address: this.contract.address,
            abi: this.contract.abi,
        }
    }

    async contractURI() {
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'contractURI',
        }) as string;
    }

    async getOwnedTokenIds(account: `0x${string}`) {
        // return [BigInt(0), BigInt(1)]   // For testing purpose
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'getOwnedTokenIds',
            args: [account]
        }) as BigInt[]
    }

    async uri(tokenId: string) {
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'uri',
            args: [tokenId]
        }) as string
    }

    async mintTracker(tokenId: string, account: string) {
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'mintTracker',
            args: [account, tokenId]
        }) as BigInt
    }

    async totalSupply(tokenId: string) {
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'totalSupply',
            args: [tokenId]
        }) as BigInt
    }

    async mint(account: string, tokenId: string, data: `0x${string}` = "0x", verification: string = "", signature: string = "") {
        if (!this.walletClient)
            throw new Error("Wallet is not provided")

        return await this.walletClient?.writeContract({
            chain: getChain(this.chain),
            account: this.walletClient.account as Account,
            ...this.contractParams,
            functionName: 'mint',
            args: [account, tokenId, data, verification, signature]
        })
    }

    async getVerification(account: `0x${string}`, id: number) {
        return await this.publicClient.readContract({
            ...this.contractParams,
            functionName: 'getVerification',
            args: [account, id]
        }) as string
    }
} 