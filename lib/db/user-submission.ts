import { Collection, ObjectId } from 'mongodb'

/**
 * Note address is EVM address. If quest is non evm related, then 
 * the user will be linked
 */
export interface UserSubmission {
    id: string
    address: string
    txHash: string
}

type UserSubmissionNullable = UserSubmission | null

export class UserSubmissionCollection {
    constructor(public collection: Collection<UserSubmission>) { }

    async getUserSubmission(id: string, address: string): Promise<UserSubmissionNullable> {
        const submission = (await this.collection.findOne({ "$and": [{ "id": id }, { "address": address }] }) as unknown) as UserSubmission | null
        if (!submission) return null

        return submission
    }

    async find(query: any) {
        return await this.collection.find(query) || []
    }

    async insert(data: UserSubmission) {
       await this.collection.insertOne(data);
    }

    async update(id: ObjectId, data: UserSubmission) {
        return this.collection.updateOne({ _id: id }, { $set: data });
    }
}
