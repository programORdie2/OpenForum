import { Post } from "models/post.model";
import { User } from "../models/user.model";
import { UserPlus } from "../utils/databaseplus.util";
import serialize from "../utils/serialize.util";
import { getComment } from "./postManager.service";

function getPostDatas(posts: any[]): any[] {
    posts = posts.map((post) => JSON.parse(post));
    
    const publicPosts = posts.filter((post) => post.public);
    return publicPosts;
}

// Get basic comment data
async function getcommentsData(comments: any[]): Promise<any[]> {
    const commentsData = comments.map(async (comment: any) => {
        return await getComment(comment.postId, comment.commentId);
    });

    return Promise.all(commentsData);
}

function prep_return(user: User, requesterId?: string): null | any {
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
        followerAmount: user.followers.length,
        followingAmount: user.following.length,
        isFollowing: user.followers.includes(requesterId as string)
    };
}

async function loadUserProfile(username: string, requesterId?: string): Promise<null | any> {
    const user = await UserPlus.findOne({ where: { username_lowercase: username.toLowerCase() } }) as User;
    return prep_return(user, requesterId);
}

async function loadUserProfileById(userId: string): Promise<null | any> {
    const user = await UserPlus.findOne({ where: { userId } }) as User;
    return prep_return(user);
}

async function getFollowersById(userId: string): Promise<null | string[]> {
    const user = await UserPlus.findOne({ where: { userId } }) as User;
    if (!user) return null;
    return user.followers;
}

async function getCommentsById(username: string, offset: number = 0, limit: number = 50): Promise<null | any> {
    offset = Math.max(offset, 0);
    limit = Math.max(limit, 1);
    limit = Math.min(limit, 50);
    
    const user = await UserPlus.findOne({ where: { username_lowercase: username.toLowerCase() } }) as User;
    if (!user) return null;

    const comments = user.comments.slice(offset, offset + limit);
    let data = await getcommentsData(comments);
    data = data.filter((comment) => comment !== null);
    return data;
}

export { loadUserProfile, loadUserProfileById, getFollowersById, getCommentsById };