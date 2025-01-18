export interface Poap {
    tokenId: BigInt;
    timestamp: BigInt;
    uri: string;
    metadata: PoapMetadata;
    verification: string; // IPFS
}

export interface PoapMetadata {
    name: string;
    description: string;
    image: string;
}