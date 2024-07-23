import { User } from "../models/user.model";

function getPostDatas(posts: Array<any>) {
    const publicPosts = posts.filter((post) => post.public);

    return publicPosts;
}

function prep_return(user: any) {
    if (!user) return null;
    return {
        username: user.username,
        createdAt: user.createdAt,
        avatar: user.avatar,
        pronounce: user.pronounce,
        bio: user.bio,
        displayName: user.displayName,
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