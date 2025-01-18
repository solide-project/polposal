import { Account, createPublicClient, createWalletClient, http, isAddressEqual, parseEther, Transaction } from "viem";
import { eduChain, eduChainTestnet } from "../poap/chain"
import {
    mainnet,
    sepolia
} from "viem/chains"

export const getChains = (chainId: number) => {
    switch (chainId) {
        case mainnet.id:
            return mainnet
        case sepolia.id:
            return sepolia
        case eduChain.id:
            return eduChain;
        default:
            return eduChainTestnet
    }
}

/**
 * Get client for rpc
 * @param testnet 
 * @returns 
 */
export const getClient = (chainId: number = eduChainTestnet.id) => {
    const chain = getChains(chainId)
    return createPublicClient({
        chain,
        transport: http(chain.rpcUrls[0])
    })
}


export const getWalletClient = (account: Account, chainId: number = eduChainTestnet.id) => {
    const chain = getChains(chainId)
    return createWalletClient({
        account,
        chain,
        transport: http(chain.rpcUrls[0])
    })
}