import { Collection, ObjectId } from 'mongodb'

/**
 * Represents a course in the questing education platform. 
 * Each course contains multiple quests and associated metadata.
 */
export interface Course {
    owner: string;
    name: string;
    title: string;
    image: string;
    description: string;
    tokenId: number;     // Token ID used for minting the NFT as a reward
    quests: string[];
}

type CourseNullable = Course | null

export class CourseCollection {
    constructor(public collection: Collection<Course>) { }

    async getByTokenId(tokenId: number): Promise<CourseNullable> {
        return this.collection.findOne({ tokenId })
    }

    async getByRepo(owner: string, name: string): Promise<CourseNullable> {
        return this.collection.findOne({ owner, name })
    }

    async find(query: any) {
        return await this.collection.find(query) || []
    }

    async insert(data: Course) {
        return await this.collection.insertOne(data);
    }

    async update(id: ObjectId, data: Course) {
        return await this.collection.updateOne({ _id: id }, { $set: data });
    }

    async getQuests(page: number = 1, pageSize: number = 25) {
        const skip = (page - 1) * pageSize;

        const results = await this.collection.find({})
            .sort({ _id: 1 }) // Assuming you want to sort by _id; change as necessary
            .skip(skip)
            .limit(pageSize)
            .toArray() as unknown;

        return results as Course[] | null
    }
}