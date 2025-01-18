import { Collection } from 'mongodb'

export interface User {
    evmAddress: `0x${string}`;
    suiAddress: string;
}

type UserNullable = User | null

interface UserExistOpts {
    evmAddress?: `0x${string}`,
    suiAddress?: string
}

export class UserCollection {
    constructor(public collection: Collection<User>) { }

    async getByEvm(evmAddress: `0x${string}`): Promise<UserNullable> {
        return this.collection.findOne({ evmAddress })
    }

    async getBySui(suiAddress: string): Promise<UserNullable> {
        return this.collection.findOne({ suiAddress })
    }

    async insert(data: User) {
        return await this.collection.insertOne(data);
    }

    async doesUserExist({
        evmAddress = "0x", suiAddress = ""
    }: UserExistOpts): Promise<UserNullable> {
        const query: { $or: UserExistOpts[] } = { $or: [] };

        if (evmAddress)
            query.$or.push({ evmAddress });

        if (suiAddress)
            query.$or.push({ suiAddress });

        if (query.$or.length === 0)
            return null;

        return this.collection.findOne(query)
    }
}
