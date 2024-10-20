import { defineChain } from 'viem'

export const openCampusCodex = defineChain({
    id: 656476,
    name: 'Open Campus Codex',
    nativeCurrency: {
        decimals: 18,
        name: 'Edu',
        symbol: 'EDU',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.open-campus-codex.gelato.digital'],
            webSocket: [''],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://opencampus-codex.blockscout.com' },
    },
})