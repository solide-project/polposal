import { defineChain } from 'viem'

const nativeCurrency = {
    decimals: 18,
    name: 'Edu',
    symbol: 'EDU',
}

export const eduChainTestnet = defineChain({
    id: 656476,
    name: 'EDU Chain Testnet',
    nativeCurrency,
    rpcUrls: {
        default: {
            http: ['https://rpc.open-campus-codex.gelato.digital'],
            webSocket: [''],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://edu-chain-testnet.blockscout.com/' },
    },
})

export const eduChain = defineChain({
    id: 41923,
    name: 'EDU Chain',
    nativeCurrency,
    rpcUrls: {
        default: {
            http: ['https://rpc.edu-chain.raas.gelato.cloud'],
            webSocket: [''],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://educhain.blockscout.com/' },
    },
})