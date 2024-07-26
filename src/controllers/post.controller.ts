import { Response } from "express";
import CustomRequest from "../types/CustomRequest";
import * as postManager from "../services/postManager.service";

// Create a post
async function createPost(req: CustomRequest, res: Response): Promise<void> {
    // Check if user is authenticated
    if (!req?.user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const { title, topic, content } = req.body;

    // Check if title, topic and content are provided
    if (!title || !topic || !content) {
        res.status(400).json({ succes: false, message: "Missing title, topic or content" });
        return;
    }

    // Create the post
    const post = await postManager.createPost(req.user.id as string, title, topic, content);
    res.json({ succes: true, post: post });
}

// Get a post
async function getPost(req: CustomRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const postId = req.params.postId;

    const post = await postManager.getPost(postId, userId);
    res.json(post);
}

// Publish a post
async function publishPost(req: CustomRequest, res: Response): Promise<void> {
    const postId = req.params.postId;
    const user = req.user;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.publishPost(postId, user.id as string);
    res.json(result);
}

// Unpublish a post
async function unpublishPost(req: CustomRequest, res: Response): Promise<void> {
    const postId = req.params.postId;
    const user = req.user;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.unpublishPost(postId, user.id as string);
    res.json(result);
}

// Delete a post
async function deletePost(req: CustomRequest, res: Response): Promise<void> {
    const postId = req.params.postId;
    const user = req.user;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.deletePost(postId, user.id as string);
    res.json(result);
}

// Update a post
async function setTitle(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const postId = req.params.postId;
    const { title } = req.body;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    // Check if title is provided
    if (!title) {
        res.status(400).json({ succes: false, message: "Missing title" });
        return;
    }

    const result = await postManager.updatePost(postId, user.id as string, title, undefined);
    res.json(result);
}

async function setContent(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const postId = req.params.postId;
    const { content } = req.body;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    // Check if content is provided
    if (!content) {
        res.status(400).json({ succes: false, message: "Missing content" });
        return;
    }

    const result = await postManager.updatePost(postId, user.id as string, undefined, content);
    res.json(result);
}

// Comment on a post
async function commentOnPost(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const postId = req.params.postId;
    let { content, parentId } = req.body;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    // Check if content is provided
    if (!content) {
        res.status(400).json({ succes: false, message: "Missing content" });
        return;
    }

    // Check if parent id is provided
    if (!parentId) parentId = undefined;

    const result = await postManager.commentOnPost(postId, user.id as string, content, parentId);
    res.json(result);
}

// Like a post
async function likePost(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const postId = req.params.postId;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.likePost(postId, user.id as string);
    res.json(result);
}

// Unlike a post
async function unlikePost(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const postId = req.params.postId;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.unlikePost(postId, user.id as string);
    res.json(result);
}

// Delete a comment
async function deleteComment(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const commentId = req.params.commentId;
    const postId = req.params.postId;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.deleteComment(postId, user.id as string, commentId);
    res.json(result);
}

// Like a comment
async function likeComment(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const commentId = req.params.commentId;
    const postId = req.params.postId;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.likeComment(postId, user.id as string, commentId);
    res.json(result);
}

// Unlike a comment
async function unlikeComment(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const commentId = req.params.commentId;
    const postId = req.params.postId;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.unlikeComment(postId, user.id as string, commentId);
    res.json(result);
}


export { 
    createPost, 
    getPost, 
    publishPost, 
    unpublishPost,
    deletePost,
    setTitle,
    setContent,
    commentOnPost,
    likePost,
    unlikePost,
    deleteComment,
    likeComment,
    unlikeComment
}