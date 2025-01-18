import { Collection, ObjectId } from 'mongodb'
import { Deployment, Transaction, NativeValue, ContractData } from '../polearn/core'

export type SubmissionType = Deployment | Transaction | NativeValue | ContractData
type SubmissionNullable = SubmissionType | null

export class SubmissionCollection {
    constructor(public collection: Collection<SubmissionType>) { }

    async getSubmission(id: string): Promise<SubmissionNullable> {
        return this.collection.findOne({ id })
    }

    async find(query: any) {
        return await this.collection.find(query) || []
    }

    async insert(data: SubmissionType) {
        await this.collection.insertOne(data);
    }

    async update(id: ObjectId, data: SubmissionType) {
        return this.collection.updateOne({ _id: id }, { $set: data });
    }
}