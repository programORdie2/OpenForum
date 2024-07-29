import { User } from "../models/user.model";
import serialize from "../utils/serialize.util";

function getPostDatas(posts: Array<any>): any[] {
    posts = posts.map((post) => JSON.parse(post));
    
    const publicPosts = posts.filter((post) => post.public);
    return publicPosts;
}

// Get basic comment data
function getcommentsData(comments: any[]): any[] {
    return comments.map((comment: any) => {
        return {
            at: comment.at,
            postId: comment.postId,
            commentId: comment.commentId
        };
    });
}

function prep_return(user: any): null | any {
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
        comments: getcommentsData(user.comments)
    };
}

async function loadUserProfile(username: string): Promise<null | any> {
    const user = await User.findOne({ where: { username_lowercase: username.toLowerCase() } });
    return prep_return(user);
}

async function loadUserProfileById(userId: string): Promise<null | any> {
    const user = await User.findOne({ where: { userId } });
    return prep_return(user);
}

export { loadUserProfile, loadUserProfileById }