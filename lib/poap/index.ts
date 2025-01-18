/**
 * Dependencies:
 * - viem
 * 
 */

import { eduChain, eduChainTestnet } from "./chain"

export { getContractAddress, getRPC } from "./utils"
export { POLPoapContract } from "./contract"

export type { PoapMetadata, Poap } from "./interface"
export const selectedNetwork = eduChain