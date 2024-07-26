import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { validatePostTitle, validateTopic } from "../utils/validator.util";
import { loadUserProfileById } from "./userProfileLoader.service";

// Make a title lowercase, replace spaces with dashes, max length 30, exlude nonalphanumeric characters;
function serializeTitle(title: string): string {
    return title.slice(0, 30).toLowerCase().replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').replace(/--/g, '-');;
}

// Generate a random id with format: <serializedTitle>-<5 digits>
async function generateRandomId(serializedTitle: string): Promise<string> {
    const _postsAmount = await Post.countDocuments({ serializedTitle });
    const postsAmount = _postsAmount.toString();
    const digitsToAdd = 4 - postsAmount.length;
    const randomDigits = Array.from({ length: digitsToAdd }, () => Math.floor(Math.random() * 10));
    const randomId = `${serializedTitle}-${postsAmount.length}${postsAmount}${randomDigits.join('')}`;
    return randomId
}

// Generate a random id
function generateCommentId(): string {
    return Math.random().toString(36).substring(2, 8);
}

async function getcommentsData(comment: any, requesterId?: string | undefined): Promise<any> {
    const _author = await loadUserProfileById(comment.userId);
    let author = { username: "[deleted user]", displayName: "[deleted user]", avatar: "/uploads/avatars/defaults/1.png" };

    if (_author) {
        author.username = _author.username;
        author.displayName = _author.displayName;
        author.avatar = _author.avatar;
    }

    return {
        author: author,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parent: comment.parent,
        commentId: comment.commentId,
        children: comment.children,
        deleted: comment.deleted,
        likes: getLikesAmount(comment.likes),
        liked: requesterId ? comment.likes.includes(requesterId) : false,
    };
}

async function getcommentsDatas(comments: any[], requesterId?: string | undefined): Promise<any[]> {
    return Promise.all(comments.map(async (comment: any) => {
        return await getcommentsData(comment, requesterId);
    }));
}

function getLikesAmount(likes: any[]): number {
    return likes.length;
}

async function getPostData(post: any, requesterId?: string | undefined): Promise<any> {
    const comments = await getcommentsDatas(post.comments, requesterId);
    const views = getViews(post.views);

    // If you add new fields here, you might need to update getPostDataForProfile
    return {
        postId: post.postId,
        title: post.title,
        topic: post.topic,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        public: post.public,
        publishedAt: post.publischedAt,
        totalViews: views.totalViews,
        uniqueViews: views.uniqueViews,
        likes: getLikesAmount(post.likes),
        comments: comments,
    };
}

function getPostDataForProfile(post: any): any {
    return {
        postId: post.postId,
        title: post.title,
        topic: post.topic,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        public: post.public,
    };
}

function getViews(views: Map<string, number>): { totalViews: number, uniqueViews: number } {
    const totalViews = Array.from(views.values()).reduce((a, b) => a + b, 0);
    const uniqueViews = views.size;

    return { totalViews, uniqueViews };
}


async function createPost(authorId: string, title: string, topic: string, content: string) {
    // Asume the author is authenticated

    if (!validatePostTitle(title)) {
        return { succes: false, message: "Invalid title" };
    }

    if (!validateTopic(topic)) {
        return { succes: false, message: "Invalid topic" };
    }

    const serializedTitle = serializeTitle(title);

    const postId = await generateRandomId(serializedTitle);
    const post = new Post({
        authorId,
        postId,
        title,
        topic,
        content,
        serializedTitle,
    });
    await post.save();

    // Add post to user profile
    await User.updateOne({ userId: authorId }, { $push: { posts: getPostDataForProfile(post) } });

    return post;
}

async function getPost(postId: string, requesterId: string | undefined, countsAsView: boolean = false): Promise<{ succes: boolean, message?: string, post?: any }> {
    postId = postId.toLowerCase();
    const post = await Post.findOne({ postId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (requesterId && post.authorId !== requesterId && !post.public) {
        return { succes: false, message: "Unauthorized" };
    }

    const _author = await loadUserProfileById(post.authorId);
    let author = { username: "[deleted user]", displayName: "[deleted user]", avatar: "/uploads/avatars/defaults/1.png" };

    if (_author) {
        author.username = _author.username;
        author.displayName = _author.displayName;
        author.avatar = _author.avatar;
    }

    // If the user isn't authenticated, generate a random id
    if (requesterId === undefined) requesterId = "[guest" + Math.floor(Math.random() * 100000000) + "]";

    if (countsAsView && post.public) {
        if (post.views.get(requesterId)) {
            post.views.set(requesterId, (post.views.get(requesterId) as number) + 1);
        } else {
            post.views.set(requesterId, 1);
        }

        // Else it won't save
        post.markModified('views');

        await post.save();
    }

    let liked = post.likes.includes(requesterId);

    const postData = {
        ...await getPostData(post, requesterId),
        author: author,
        liked: liked
    };

    return { succes: true, post: postData };
}

async function publishPost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }
    if (post.public) {
        return { succes: false, message: "Post already published" };
    }

    // Make sure only the author can publish
    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    post.public = true;
    post.publischedAt = new Date();
    await post.save();

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId: post.postId } } });
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostDataForProfile(post) } });

    return { succes: true, post: post };
}

async function unpublishPost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }
    if (!post.public) {
        return { succes: false, message: "Post already unpublished" };
    }

    // Make sure only the author can unpublish
    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    post.public = false;
    post.publischedAt = null;
    await post.save();

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId: post.postId } } });
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostDataForProfile(post) } });

    return { succes: true, post: post };
}

async function deletePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    // Make sure only the author can delete
    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    // Delete post
    await Post.deleteOne({ postId });

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId } } });

    return { succes: true };
}

async function updatePost(postId: string, requesterId: string, title: string | undefined, content: string | undefined): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!title && !content) {
        return { succes: false, message: "Nothing to update" };
    }

    // Make sure only the author can update
    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    const now = new Date();
    if (title) {
        const serializedTitle = serializeTitle(title);

        post.title = title;
        post.serializedTitle = serializedTitle;
        post.postId = await generateRandomId(serializedTitle);
        post.comments.forEach(async (comment) => {
            // Update comment postIds in user
            const authorId = comment.userId;
            const author = await User.findOne({ userId: authorId });
            const commentId = comment.commentId;

            if (!author) return;

            const commentInUser = author.comments.find((r) => r.commentId === commentId);
            if (!commentInUser) return;

            commentInUser.postId = post.postId;
            await author.save();
        })
    }

    if (content) {
        post.content = content;
    }

    post.updatedAt = now;
    await post.save();

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId: postId } } });
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostDataForProfile(post) } });

    return { succes: true, post: post };
}

async function getUserPosts(userId: string): Promise<{ succes: boolean, message?: string, posts?: any[] }> {
    // Asume the author is authenticated
    const user = await User.findOne({ userId: userId });

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const posts = user.posts;

    return { succes: true, posts: posts };
}

async function commentOnPost(postId: string, requesterId: string, content: string, parentId?: string): Promise<{ succes: boolean, message?: string, comment?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    // Only the author can comment if the post is not public
    if (!post.public && post.authorId !== requesterId) {
        return { succes: false, message: "Post is not public" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const commentId = generateCommentId();

    if (parentId) {
        const parent = post.comments.find((comment) => comment.commentId === parentId);
        if (!parent) {
            return { succes: false, message: "Parent does not exist" };
        }

        parent.children.push(commentId);
    }

    if (!parentId) parentId = "";

    const comment = {
        userId: requesterId,
        content: content,
        commentId: commentId,
        parent: parentId,
        likes: [],
        children: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    post.comments.push(comment);

    await post.save();

    // Update user
    user.comments.push({ postId: post.postId, commentId });
    await user.save();

    return { succes: true, comment: getcommentsData(comment) };
}

async function deleteComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const comment = post.comments.find((comment) => comment.commentId === commentId);
    if (!comment) {
        return { succes: false, message: "Comment does not exist" };
    }

    // Only the author of the post and the author of the comment can delete
    if (post.authorId !== requesterId && comment.userId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    comment.deleted = true;
    comment.content = ".";

    await post.save();

    // Update user
    user.comments.pull({ postId: post.postId, commentId });
    await user.save();

    return { succes: true };
}

async function likePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post || (!post.public && post.authorId !== requesterId)) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    if (post.likes.includes(user.userId)) {
        return { succes: false, message: "Already liked" };
    }

    post.likes.push(user.userId);
    await post.save();

    return { succes: true };
}

async function unlikePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post || (!post.public && post.authorId !== requesterId)) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    if (!post.likes.includes(user.userId)) {
        return { succes: false, message: "Not liked" };
    }

    post.likes.splice(post.likes.indexOf(user.userId), 1);
    await post.save();

    return { succes: true };
}

async function likeComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const comment = post.comments.find((comment) => comment.commentId === commentId);
    if (!comment) {
        return { succes: false, message: "Comment does not exist" };
    }

    if (comment.likes.includes(user.userId)) {
        return { succes: false, message: "Already liked" };
    }

    comment.likes.push(user.userId);
    await post.save();

    return { succes: true };
}

async function unlikeComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const comment = post.comments.find((comment) => comment.commentId === commentId);
    if (!comment) {
        return { succes: false, message: "Comment does not exist" };
    }

    if (!comment.likes.includes(user.userId)) {
        return { succes: false, message: "Not liked" };
    }

    comment.likes.splice(comment.likes.indexOf(user.userId), 1);
    await post.save();

    return { succes: true };
}

export {
    createPost,
    getPost,
    publishPost,
    unpublishPost,
    deletePost,
    updatePost,
    getUserPosts,
    commentOnPost,
    likePost,
    unlikePost,
    deleteComment,
    likeComment,
    unlikeComment
};