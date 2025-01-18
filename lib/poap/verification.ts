export interface Quest {
    version: string;
    owner: string;
    name: string;
    completed: number;
}

export interface Verification {
    id: string;
    chain: string;
    type: string;
    hash: `0x${string}`;
}

export interface VerificationSchema {
    quest: Quest;
    verification: Verification[];
}

