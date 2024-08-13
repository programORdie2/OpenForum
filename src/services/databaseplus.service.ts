import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { Tag } from "../models/tags.model";

import { getFromCache, setInCache } from "../utils/cache.util";

class DatabasePlus {
    private _instanceName: "User" | "Post" | "Tag";

    constructor(instance: "User" | "Post" | "Tag") {
        this._instanceName = instance;
    }

    public async findOne(options: object): Promise<any | null> {
        const optionsId = this._instanceName + JSON.stringify(options);

        const cacheValue = await getFromCache("recentQueries", optionsId);
        if (cacheValue) {
            return cacheValue;
        }

        const data = 
            this._instanceName === "User" ? await User.findOne(options) : 
            this._instanceName === "Post" ? await Post.findOne(options) :
            this._instanceName === "Tag" ? await Tag.findOne(options) : null;

        if (!data) return data;

        setInCache("recentQueries", optionsId, data);

        return data;
    }

    public async find(options: object): Promise<any | null> {
        const optionsId = "all" + this._instanceName + JSON.stringify(options);
        const cacheValue = await getFromCache("recentQueries", optionsId);
        if (cacheValue) {
            return cacheValue;
        }

        const data = 
            this._instanceName === "User" ? await User.findAll(options) : 
            this._instanceName === "Post" ? await Post.findAll(options) :
            this._instanceName === "Tag" ? await Tag.findAll(options) : null;

        if (!data) return data;

        setInCache("recentQueries", optionsId, data);

        return data;
    }
}

const UserPlus = new DatabasePlus("User");
const PostPlus = new DatabasePlus("Post");
const TagPlus = new DatabasePlus("Tag");

export { UserPlus, PostPlus, TagPlus };