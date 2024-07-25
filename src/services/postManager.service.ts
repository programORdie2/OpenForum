import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { validatePostTitle, validateTopic } from "../utils/validator.util";
import { loadUserProfileById } from "./userProfileLoader.service";

function serializeTitle(title: string) {
    // Lowercase, replace spaces with dashes, max length 30, exlude nonalphanumeric characters;
    return title.slice(0, 30).toLowerCase().replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').replace(/--/g, '-');;
}

async function generateRandomId(serializedTitle: string) {
    // Generate a random id of 5 digits
    const _postsAmount = await Post.countDocuments({ serializedTitle });
    const postsAmount = _postsAmount.toString();
    const digitsToAdd = 4 - postsAmount.length;
    const randomDigits = Array.from({ length: digitsToAdd }, () => Math.floor(Math.random() * 10));
    const randomId = `${serializedTitle}-${postsAmount.length}${postsAmount}${randomDigits.join('')}`;
    return randomId
}

function generateCommentId() {
    return Math.random().toString(36).substring(2, 8);
}

function getcommentsData(comments: any[]) {
    return comments.map((comment: any) => {
        return {
            authorId: comment.userId,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            parent: comment.parent,
            commentId: comment.commentId,
            children: comment.children,
            deleted: comment.deleted
        };
    });
}

function getLikesAmount(likes: any[]) {
    return likes.length;
}

function getPostData(post: any) {
    const views = getViews(post.views);

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
        comments: getcommentsData(post.comments)
    };
}

function getViews(views: Map<string, number>) {
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

    await User.updateOne({ userId: authorId }, { $push: { posts: getPostData(post) } });

    return post;
}

async function getPost(postId: string, requesterId: string | undefined, countsAsView: boolean = false) {
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
        ...getPostData(post),
        author: author,
        liked: liked
    };

    return { succes: true, post: postData };
}

async function publishPost(postId: string, requesterId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }
    if (post.public) {
        return { succes: false, message: "Post already published" };
    }

    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    post.public = true;
    post.publischedAt = new Date();
    await post.save();

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId: post.postId } } });
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostData(post) } });

    return { succes: true, post: post };
}

async function unpublishPost(postId: string, requesterId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }
    if (!post.public) {
        return { succes: false, message: "Post already unpublished" };
    }

    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    post.public = false;
    post.publischedAt = null;
    await post.save();

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId: post.postId } } });
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostData(post) } });

    return { succes: true, post: post };
}

async function deletePost(postId: string, requesterId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    await Post.deleteOne({ postId });

    // Update user
    await User.updateOne({ userId: post.authorId }, { $pull: { posts: { postId } } });

    return { succes: true };
}

async function updatePost(postId: string, requesterId: string, title: string | undefined, content: string | undefined) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    if (!title && !content) {
        return { succes: false, message: "Nothing to update" };
    }

    const now = new Date();
    if (title) {
        const serializedTitle = serializeTitle(title);

        post.title = title;
        post.serializedTitle = serializedTitle;
        post.postId = await generateRandomId(serializedTitle);
        post.comments.forEach(async (comment) => {
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
    await User.updateOne({ userId: post.authorId }, { $push: { posts: getPostData(post) } });

    return { succes: true, post: post };
}

async function getUserPosts(userId: string) {
    // Asume the author is authenticated
    const user = await User.findOne({ userId: userId });

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const posts = user.posts;

    return { succes: true, posts: posts };
}

async function reactOnPost(postId: string, requesterId: string, content: string, parentId?: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

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

    const comment = {
        userId: requesterId,
        content: content,
        commentId: commentId,
        parent: parentId,
    }

    post.comments.push(comment);

    await post.save();

    // Update user
    user.comments.push({ postId: post.postId, commentId });
    await user.save();

    return { succes: true, comment: comment };
}

async function deleteComment(postId: string, requesterId: string, commentId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    if (post.authorId !== requesterId) {
        return { succes: false, message: "Unauthorized" };
    }

    const comment = post.comments.find((comment) => comment.commentId === commentId);
    if (!comment) {
        return { succes: false, message: "Comment does not exist" };
    }

    comment.deleted = true;
    comment.content = ".";

    await post.save();

    // Update user
    user.comments.pull({ postId: post.postId, commentId });
    await user.save();

    return { succes: true };
}

async function likePost(postId: string, requesterId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
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

async function dislikePost(postId: string, requesterId: string) {
    // Asume the author is authenticated
    const post = await Post.findOne({ postId });
    const user = await User.findOne({ userId: requesterId });

    if (!post) {
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

export { createPost, getPost, publishPost, unpublishPost, deletePost, updatePost, getUserPosts, reactOnPost, likePost, dislikePost, deleteComment };