// Should be AbiFunction from 'viem'
type AbiFunction = any;

/**
 * Base interface for submissions, representing a common schema for 
 * both deployments and transactions.
 */
export interface Submission {
    path: string;
    id: string;
    chain: string;
    type: "deployment" | "transaction" | "value" | "data";
    description?: string;
}

/**
 * Represents a deployment submission, with additional bytecode information.
 */
export interface Deployment extends Submission {
    type: "deployment";
    bytecode: string;  // sha256 hash of the bytecode
}

/**
 * Represents a transaction submission, with ABI and contract details.
 */
export interface Transaction extends Submission {
    type: "transaction";
    abi: AbiFunction[];
    contract?: string;
    args: any[];
}

/**
 * Represents a value submission, with a from address and a specific value
 */
export interface NativeValue extends Submission {
    type: "value";
    from: `0x${string}`;
    value: string;      // should be a number value
    symbol?: "eq" | "lt" | "gt" | "lte" | "gte"
}

/**
 * Represents getting a value
 */
export interface ContractData extends Submission {
    type: "data";
    contract?: string;
    variable: string;
    abi: any[];
    args?: any[];
}

export type SubmissionType = Deployment | Transaction | NativeValue | ContractData

export interface SubmissionOpt {
    /**
     * Note for testing the quest, we ignore the owner of submission 
     * */
    testing?: boolean
}

export const defaultOpts: SubmissionOpt = {
    testing: false
}

export interface SubmissionBody {
    id: `0x${string}`
    transactionHash: `0x${string}`
    user: `0x${string}`
}

export interface SubmissionReceipt {
    result: boolean
}