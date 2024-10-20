import { createPublicClient, createWalletClient, http, isAddressEqual, parseEther, Transaction } from "viem";
import { openCampusCodex } from "./open-campus-codex";
import { getChains } from ".";

const defaultChain = openCampusCodex.id.toString();

/**
 * Required staking amount is 10 native token
 */
const STAKING_AMOUNT = (chainId: string) => {
    switch (chainId) {
        case openCampusCodex.id.toString():
            return parseEther('1')
        default:
            return parseEther('10')
    }
}

/**
 * This check if the staking amount is correct
 * @param hash 
 * @returns 
 */
export const isSufficient = (
    hash: Transaction,
    chainId: string = defaultChain
) =>
    hash.value === STAKING_AMOUNT(chainId)

/**
 * Staking address
 */
const STAKING_ADDRESS = (chainId: string) => {
    switch (chainId) {
        case openCampusCodex.id.toString():
            return "0xC5632D3194F5337E3B31562B560D3db599769127"
        default:
            return "0x"
    }
}

/**
 * This checks if the payload staking amount is sent to correct reciepient
 * @param hash 
 * @param chainId 
 * @returns 
 */
export const isCorrectAddress = (
    hash: Transaction,
    chainId: string = defaultChain
) =>
    isAddressEqual(hash.to as `0x${string}`, STAKING_ADDRESS(chainId))

/**
 * Get client for rpc
 * @param testnet 
 * @returns 
 */
export const getClient = (chainId: number = openCampusCodex.id) => {
    const chain = getChains(chainId)
    return createPublicClient({
        chain,
        transport: http(chain.rpcUrls[0])
    })
}


export const getWalletClient = (chainId: number = openCampusCodex.id) => {
    const chain = getChains(chainId)
    return createWalletClient({
        chain,
        transport: http(chain.rpcUrls[0])
    })
}