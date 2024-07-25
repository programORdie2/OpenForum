import { User } from "../models/user.model";
import serialize from "../utils/serialize.util";

function getPostDatas(posts: Array<any>) {
    const publicPosts = posts.filter((post) => post.public);

    return publicPosts;
}

function getReactionsData(reactions: any[]) {
    return reactions.map((reaction: any) => {
        return {
            at: reaction.at,
            postId: reaction.postId,
            reactionId: reaction.reactionId
        };
    });
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
        reactions: getReactionsData(user.reactions)
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