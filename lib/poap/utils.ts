import { eduChain, eduChainTestnet } from "./chain";

export const contracts: Record<string, `0x${string}`> = {
    /**
     * "0x7aEb202a1568a80d78A68aA51211cFE3BCD315F9"
     */
    [eduChain.id]: "0xe5F6f93aBbaeb1391f67Bb0eA5727aCD1DD74d91",
    
    /**
     * "0x9B6089b63BEb5812c388Df6cb3419490b4DF4d54"
     * "0x4DB78091c718F7a3E2683c2D730Fc86DfF322235"
     * "0xB10999282d0DD5990DB97b6EEa2F07b6ca9275D0"
     * */
    [eduChainTestnet.id]: "0x6F5CCf043Bd6F7D1339085CfB1d53946A3323382",

}

export const getRPC = (chain: string) => {
    if (chain === eduChainTestnet.id.toString()) {
        return eduChainTestnet.rpcUrls.default.http[0]
    }

    return eduChain.rpcUrls.default.http[0]
}

export const getChain = (chain: string) => {
    if (chain === eduChainTestnet.id.toString()) {
        return eduChainTestnet
    }

    return eduChain
}

export const getContractAddress = (chain: string) => contracts[chain] || "0x"