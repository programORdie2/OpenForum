import { UserPlus, PostPlus } from "../utils/databaseplus.util";
import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { validatePostTitle, validateTags } from "../utils/validator.util";
import { createCommentNotification, createLikeCommentNotification, createLikeNotification, createPostNotification, createReplyNotification } from "./notification.service";
import { getFollowersById, loadUserProfileById } from "./userProfileLoader.service";
import { addPostToTags, pullPostFromTags } from "./tagManager.service";

type Views = {
    [key: string]: number;
}
interface Comment {
    userId: string;
    commentId: string;
    content: string;
    parent: string;
    children: string[];
    likes: string[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted: boolean;
}

// Make a title lowercase, replace spaces with dashes, max length 30, exlude nonalphanumeric characters;
function serializeTitle(title: string): string {
    return title.slice(0, 30).toLowerCase().replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').replace(/--/g, '-');;
}

// Generate a random id with format: <serializedTitle>-<5 digits>
async function generateRandomId(serializedTitle: string): Promise<string> {
    const _postsAmount = await Post.count({ where: { serializedTitle: serializedTitle } });
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

async function _pushPostToUser(userId: string, post: Post): Promise<void> {
    const user = await UserPlus.findOne({ where: { userId: userId } }) as User;

    if (!user) {
        return;
    }

    // Update the posts array
    const postData = getPostDataForProfile(post);
    const updatedPosts = [...(user.posts || []), postData];

    // Assign the updated posts array
    user.posts = updatedPosts;

    // Save the updated user record
    await user.save();
}

async function _pullPostFromUser(userId: string, postId: string): Promise<void> {
    const user = await User.findOne({ where: { userId: userId } });

    if (!user) {
        return;
    }

    const postIdx = user.posts.findIndex((post: string) => JSON.parse(post).postId === postId);

    user.posts.splice(postIdx, 1);

    // Save the updated user record
    user.changed('posts', true);
    await user.save();
}


async function getcommentsData(comment: Comment, requesterId?: string | undefined, withAuthor: boolean = true): Promise<{ content: string, createdAt?: Date, updatedAt?: Date, parent: string, commentId: string, children: string[], deleted: boolean, likes: number, liked: boolean, author: any }> {
    const author = { username: "[deleted user]", displayName: "[deleted user]", avatar: "/uploads/avatars/defaults/1.png" };

    if (withAuthor) {
        const _author = await loadUserProfileById(comment.userId);

        if (_author) {
            author.username = _author.username;
            author.displayName = _author.displayName;
            author.avatar = _author.avatar;
        }
    }

    const data = {
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parent: comment.parent,
        commentId: comment.commentId,
        children: comment.children,
        deleted: comment.deleted,
        likes: getLikesAmount(comment.likes),
        liked: requesterId ? comment.likes.includes(requesterId) : false,
        author: {},
    };

    if (withAuthor) {
        data.author = author;
    }

    return data;
}

async function getcommentsDatas(comments: Comment[], requesterId?: string | undefined): Promise<any[]> {
    return Promise.all(comments.map(async (comment: Comment) => {
        return await getcommentsData(comment, requesterId);
    }));
}

function getLikesAmount(likes: string[]): number {
    return likes.length;
}

async function getPostData(post: any, requesterId?: string | undefined): Promise<any> {
    const comments = await getcommentsDatas(post.comments, requesterId);
    const views = getViews(post.views);

    // If you add new fields here, you might need to update getPostDataForProfile
    return {
        postId: post.postId,
        title: post.title,
        tags: post.tags,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        public: post.public,
        publishedAt: post.publishedAt,
        totalViews: views.totalViews,
        uniqueViews: views.uniqueViews,
        likes: getLikesAmount(post.likes),
        comments: comments,
    };
}

function getPostDataForProfile(post: Post): any {
    return {
        postId: post.postId,
        title: post.title,
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        public: post.public,
        publishedAt: post.publishedAt,
    };
}

function getViews(views: Map<string, number>): { totalViews: number, uniqueViews: number } {
    const totalViews = Array.from(views.values()).reduce((a, b) => a + b, 0);
    const uniqueViews = views.size;

    return { totalViews, uniqueViews };
}


async function createPost(authorId: string, title: string, tags: string[], content: string) {
    // Asume the author is authenticated

    if (!validatePostTitle(title)) {
        return { succes: false, message: "Invalid title" };
    }

    if (!validateTags(tags)) {
        return { succes: false, message: "Invalid tags" };
    }

    if (tags.length < 0 || tags.length > 5) {
        return { succes: false, message: "Max 5 tags, min 0" };
    }

    const serializedTitle = serializeTitle(title);

    const postId = await generateRandomId(serializedTitle);
    const post = await Post.create({
        authorId,
        postId,
        title,
        tags,
        content,
        serializedTitle,
        views: [],
        comments: [],
        likes: [],
        public: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
    });
    await post.save();

    // Add post to user profile
    await _pushPostToUser(authorId, post);
    await addPostToTags(tags, postId);

    return post;
}

async function getPost(postId: string, requesterId: string | undefined, countsAsView = false): Promise<{ succes: boolean, message?: string, post?: any }> {
    postId = postId.toLowerCase();
    const post = await Post.findOne({ where: { postId: postId } });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (requesterId && post.authorId !== requesterId && !post.public) {
        return { succes: false, message: "Unauthorized" };
    }

    const _author = await loadUserProfileById(post.authorId);
    const author = { username: "[deleted user]", displayName: "[deleted user]", avatar: "/uploads/avatars/defaults/1.png" };

    if (_author) {
        author.username = _author.username;
        author.displayName = _author.displayName;
        author.avatar = _author.avatar;
    }

    // If the user isn't authenticated, generate a random id
    if (requesterId === undefined) requesterId = `[guest${Math.floor(Math.random() * 100000000)}]`;

    if (countsAsView && post.public) {
        const views: Views = post.views as Views;

        if (views[requesterId]) {
            views[requesterId] += 1;
        } else {
            views[requesterId] = 1;
        }

        // Assign the updated views object
        post.views = views;

        await post.save();
    }

    const liked = post.likes.includes(requesterId);

    const postData = {
        ...await getPostData(post, requesterId),
        author: author,
        liked: liked
    };

    return { succes: true, post: postData };
}

async function publishPost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({
        where: { postId: postId },
    });
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
    post.publishedAt = new Date();

    post.changed('publishedAt', true);
    await post.save();

    // Update user
    await _pullPostFromUser(post.authorId, post.postId);
    await _pushPostToUser(post.authorId, post);

    const followers = await getFollowersById(post.authorId);
    if (!followers) return { succes: true, post: post };

    await createPostNotification(post.authorId, followers, postId);

    return { succes: true, post: post };
}

async function unpublishPost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
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
    await post.save();

    // Update user
    await _pullPostFromUser(post.authorId, post.postId);
    await _pushPostToUser(post.authorId, post);

    return { succes: true, post: post };
}

async function deletePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    // Make sure only the author can delete
    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    // Delete post
    await Post.destroy({ where: { postId: postId } });

    // Update user
    await _pullPostFromUser(post.authorId, postId);
    await pullPostFromTags(post.tags, postId);

    return { succes: true };
}

async function updatePost(postId: string, requesterId: string, title: string | undefined, content: string | undefined): Promise<{ succes: boolean, message?: string, post?: any }> {
    // Asume the author is authenticated
    const post = await PostPlus.findOne({ where: { postId: postId } }) as Post;
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
        for (const comment of post.comments) {
            // Update comment postIds in user
            const authorId = comment.userId;
            const author = await UserPlus.findOne({ where: { userId: authorId } }) as User;
            const commentId = comment.commentId;

            if (!author) continue;

            const commentInUser = author.comments.find((r: any) => r.commentId === commentId);
            if (!commentInUser) continue;

            commentInUser.postId = post.postId;
            await author.save();
        }
    }

    if (content) {
        post.content = content;
    }

    post.updatedAt = now;
    await post.save();

    // Update user
    await _pullPostFromUser(post.authorId, postId);
    await _pushPostToUser(post.authorId, post);

    return { succes: true, post: post };
}

async function getUserPosts(userId: string): Promise<{ succes: boolean, message?: string, posts?: any[] }> {
    // Asume the author is authenticated
    const user = await UserPlus.findOne({ where: { userId: userId } }) as User;

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const posts = user.posts.map((post: any) => JSON.parse(post));

    return { succes: true, posts: posts };
}

async function commentOnPost(postId: string, requesterId: string, content: string, parentId?: string): Promise<{ succes: boolean, message?: string, comment?: any }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await User.findOne({ where: { userId: requesterId } });

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

        await createReplyNotification(requesterId, parent.userId, post.postId, commentId);
    }

    if (!parentId) parentId = "";

    const comment: Comment = {
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
    post.changed("comments", true);

    await post.save();

    // Update user
    user.comments.push({ postId: post.postId, commentId, at: new Date() });
    user.changed("comments", true);
    await user.save();

    await createCommentNotification(requesterId, post.authorId, post.postId, commentId);

    const commentData = await getcommentsData(comment);

    return { succes: true, comment: commentData };
}

async function deleteComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await User.findOne({ where: { userId: requesterId } });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const commentIdx = post.comments.findIndex((comment) => comment.commentId === commentId);
    const comment = post.comments[commentIdx];
    if (commentIdx < 0) {
        return { succes: false, message: "Comment does not exist" };
    }

    // Only the author of the post and the author of the comment can delete
    if (post.authorId !== requesterId && comment.userId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    comment.deleted = true;
    comment.content = ".";

    post.comments[commentIdx] = comment;

    post.changed('comments', true);
    await post.save();

    // Update user
    user.comments = user.comments.filter((r: any) => r.commentId !== commentId || r.postId !== post.postId);
    user.changed('comments', true);
    await user.save();

    return { succes: true };
}

async function likePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await UserPlus.findOne({ where: { userId: requesterId } }) as User;

    if (!post || (!post.public && post.authorId !== requesterId)) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    if (post.likes.includes(user.userId)) {
        return { succes: false, message: "Already liked" };
    }

    const likes = post.likes || [];
    likes.push(user.userId);
    post.likes = likes;

    // Else it won't save
    post.changed('likes', true);
    await post.save();

    await createLikeNotification(requesterId, post.authorId, post.postId);

    return { succes: true };
}

async function unlikePost(postId: string, requesterId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await UserPlus.findOne({ where: { userId: requesterId } }) as User;

    if (!post || (!post.public && post.authorId !== requesterId)) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const likes = post.likes || [];

    const idx = likes.indexOf(user.userId);
    if (idx < 0) {
        return { succes: false, message: "Not liked" };
    }

    // Remove the user from the likes
    likes.splice(idx, 1);
    post.likes = likes;

    // Else it won't save
    post.changed('likes', true);

    await post.save();

    return { succes: true };
}

async function likeComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await UserPlus.findOne({ where: { userId: requesterId } }) as User;

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const commentIdx = post.comments.findIndex((comment) => comment.commentId === commentId);
    const comment = post.comments[commentIdx];
    if (commentIdx < 0) {
        return { succes: false, message: "Comment does not exist" };
    }

    if (comment.likes.includes(user.userId)) {
        return { succes: false, message: "Already liked" };
    }

    const likes = comment.likes || [];
    likes.push(user.userId);
    comment.likes = likes;

    post.comments[commentIdx] = comment;

    post.changed('comments', true);
    await post.save();

    await createLikeCommentNotification(requesterId, comment.userId, post.postId, comment.commentId);

    return { succes: true };
}

async function unlikeComment(postId: string, requesterId: string, commentId: string): Promise<{ succes: boolean, message?: string }> {
    // Asume the author is authenticated
    const post = await Post.findOne({ where: { postId: postId } });
    const user = await UserPlus.findOne({ where: { userId: requesterId } }) as User;

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const commentIdx = post.comments.findIndex((comment) => comment.commentId === commentId);
    const comment = post.comments[commentIdx];
    if (commentIdx < 0) {
        return { succes: false, message: "Comment does not exist" };
    }

    if (!comment.likes.includes(user.userId)) {
        return { succes: false, message: "Not liked" };
    }

    comment.likes.splice(comment.likes.indexOf(user.userId), 1);
    post.comments[commentIdx] = comment;

    post.changed('comments', true);
    await post.save();

    return { succes: true };
}

async function getComment(postId: string, commentId: string): Promise<null | any> {
    const post = await PostPlus.findOne({ where: { postId: postId } }) as Post;
    if (!post) {
        return null;
    }
    if (!post.public) {
        return null;
    }
    const comment = post.comments.find((comment: any) => comment.commentId === commentId);
    if (!comment) {
        return null;
    }

    const data = await getcommentsData(comment, undefined, false);
    
    const allData = {
        ...data,
        postTitle: post.title,
        postTags: post.tags
    };

    return allData;
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
    unlikeComment,
    getComment
};