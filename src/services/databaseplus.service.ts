import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { Tag } from "../models/tags.model";

import redisClient from "../utils/redis.util";

class DatabasePlus {
    private _instanceName: "User" | "Post" | "Tag";

    constructor(instance: "User" | "Post" | "Tag") {
        this._instanceName = instance;
    }

    private instanceToString(instance: User | Post | Tag | User[] | Post[] | Tag[]) {
        const data = JSON.stringify(instance);
        return data;
    }

    public async findOne(options: object): Promise<User | Post | Tag | null> {
        const redisId = `recentQueries:${this._instanceName}:${JSON.stringify(options)}`;

        const cacheValue = await redisClient.get(redisId);
        if (cacheValue) {
            return JSON.parse(cacheValue);
        }

        const data = 
            this._instanceName === "User" ? await User.findOne(options) : 
            this._instanceName === "Post" ? await Post.findOne(options) :
            this._instanceName === "Tag" ? await Tag.findOne(options) : null;

        if (!data) return data;

        await redisClient.set(redisId, this.instanceToString(data));
        await redisClient.expire(redisId, 10);

        return data;
    }

    public async find(options: object): Promise<User[] | Post[] | Tag[] | null> {
        const optionsId = `recentQueries:all:${this._instanceName}:${JSON.stringify(options)}`;
        const cacheValue = await redisClient.get(optionsId);
        if (cacheValue) {
            return JSON.parse(cacheValue);
        }

        const data = 
            this._instanceName === "User" ? await User.findAll(options) : 
            this._instanceName === "Post" ? await Post.findAll(options) :
            this._instanceName === "Tag" ? await Tag.findAll(options) : null;

        if (!data) return data;

        await redisClient.set(optionsId, this.instanceToString(data));
        await redisClient.expire(optionsId, 10);

        return data;
    }
}

const UserPlus = new DatabasePlus("User");
const PostPlus = new DatabasePlus("Post");
const TagPlus = new DatabasePlus("Tag");

export { UserPlus, PostPlus, TagPlus };