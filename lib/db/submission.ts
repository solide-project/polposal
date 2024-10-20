import { Collection, ObjectId } from 'mongodb'

// Should be AbiFunction from 'viem'
type AbiFunction = any;

/**
 * Base interface for submissions, representing a common schema for 
 * both deployments and transactions.
 */
export interface Submission {
    path?: string;
    id: string;
    chain: string;
    type: "deployment" | "transaction";
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

type SubmissionNullable = Deployment | Transaction | null

export class SubmissionCollection {
    constructor(public collection: Collection<Deployment | Transaction>) { }

    async getSubmission(id: string): Promise<SubmissionNullable> {
        return this.collection.findOne({ id })
    }

    async find(query: any): Promise<(Deployment | Transaction)[]> {
        return await this.collection.find(query).toArray() || []
    }

    async insert(data: Deployment | Transaction) {
        return this.collection.insertOne(data);
    }

    async update(id: ObjectId, data: Deployment | Transaction) {
        return this.collection.updateOne({ _id: id }, { $set: data });
    }
}