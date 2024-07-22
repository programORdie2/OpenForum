import { Post } from "../models/post.model";
import { v4 as uuidv4 } from "uuid";

function generateRandomId() {
    return uuidv4();
}

async function createPost(authorId: string, title: string, topic: string, content: string) {
    // Asume the author is authenticated

    const postId = generateRandomId();
    const post = new Post({
        authorId,
        postId,
        title,
        topic,
        content,
    });
    await post.save();

    return post;
}

async function getPost(postId: string) {
    const post = await Post.findOne({ postId });
    return post;
}

export { createPost, getPost };