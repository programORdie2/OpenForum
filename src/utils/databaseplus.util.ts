import { Post } from "../models/post.model";
import { User } from "../models/user.model";

import { getFromCache, setInCache } from "../services/cache.service";

class DatabasePlus {
    private _instanceName: "User" | "Post";

    constructor(instance: "User" | "Post") {
        this._instanceName = instance;
    }

    public async findOne(options: object): Promise<any | null> {
        const optionsId = JSON.stringify(options);

        const cacheValue = await getFromCache("recentQueries", optionsId);
        if (cacheValue) {
            return cacheValue;
        }

        const data = this._instanceName === "User" ? await User.findOne(options) : await Post.findOne(options);
        if (!data) return data;

        setInCache("recentQueries", optionsId, data);

        return data;
    }
}

const UserPlus = new DatabasePlus("User");
const PostPlus = new DatabasePlus("Post");

export { UserPlus, PostPlus }