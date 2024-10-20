import { openCampusCodex } from "./open-campus-codex"
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
        case openCampusCodex.id:
        default:
            return openCampusCodex
    }
}