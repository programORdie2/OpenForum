import { User } from "../models/user.model";
import serialize from "../utils/serialize.util";

function getPostDatas(posts: Array<any>) {
    const publicPosts = posts.filter((post) => post.public);

    return publicPosts;
}

function prep_return(user: any) {
    if (!user) return null;
    return {
        username: serialize(user.username),
        createdAt: user.createdAt,
        avatar: user.avatar,
        pronounce: serialize(user.pronounce),
        bio: serialize(user.bio),
        displayName: serialize(user.displayName),
        location: serialize(user.location),
        posts: getPostDatas(user.posts),
    };
}

async function loadUserProfile(username: string) {
    const user = await User.findOne({ username_lowercase: username.toLowerCase() });
    return prep_return(user);
}

async function loadUserProfileById(userId: string) {
    const user = await User.findOne({ userId });
    
    return prep_return(user);
}

export { loadUserProfile, loadUserProfileById }