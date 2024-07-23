import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { validatePostTitle, validateTopic } from "./validator.service";

function serializeTitle(title: string) {
    return title.toLowerCase().replace(/ /g, '-');
}

async function generateRandomId(serializedTitle: string) {
    // Generate a random id of 5 digits
    const _postsAmount = await Post.countDocuments({ serializedTitle });
    const postsAmount = _postsAmount.toString();
    const digitsToAdd = 5 - postsAmount.length;
    const randomDigits = Array.from({ length: digitsToAdd }, () => Math.floor(Math.random() * 10));
    const randomId = `${serializedTitle}-${postsAmount}${randomDigits.join('')}`;
    return randomId;
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

    await User.updateOne({ userId: authorId }, { $push: { posts: postId } });

    return post;
}

async function getPost(postId: string, requesterId: string | undefined) {
    postId = postId.toLowerCase();
    const post = await Post.findOne({ postId });

    if (!post) {
        return { succes: false, message: "Post does not exist" };
    }

    if (requesterId && post.authorId !== requesterId && !post.public) {
        return { succes: false, message: "Unauthorized" };
    }

    return { succes: true, post };
}

export { createPost, getPost };