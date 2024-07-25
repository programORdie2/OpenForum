import { Response } from "express";
import CustomRequest from "../types/CustomRequest";
import * as postManager from "../services/postManager.service";

async function createPost(req: CustomRequest, res: Response) {
    if (!req?.user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const { title, topic, content } = req.body;

    if (!title || !topic || !content) {
        res.status(400).json({ succes: false, message: "Missing title, topic or content" });
        return;
    }

    const post = await postManager.createPost(req.user.id as string, title, topic, content);
    res.json({ succes: true, post: post });
}

async function getPost(req: CustomRequest, res: Response) {
    const userId = req.user?.id;
    const postId = req.params.postId;

    const post = await postManager.getPost(postId, userId);
    res.json(post);
}

async function publishPost(req: CustomRequest, res: Response) {
    const postId = req.params.postId;
    const user = req.user;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.publishPost(postId, user.id as string);
    res.json(result);
}

async function unpublishPost(req: CustomRequest, res: Response) {
    const postId = req.params.postId;
    const user = req.user;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.unpublishPost(postId, user.id as string);
    res.json(result);
}

async function deletePost(req: CustomRequest, res: Response) {
    const postId = req.params.postId;
    const user = req.user;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.deletePost(postId, user.id as string);
    res.json(result);
}

async function setTitle(req: CustomRequest, res: Response) {
    const user = req.user;
    const postId = req.params.postId;
    const { title } = req.body;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    if (!title) {
        res.status(400).json({ succes: false, message: "Missing title" });
        return;
    }

    const result = await postManager.updatePost(postId, user.id as string, title, undefined);
    res.json(result);
}

async function setContent(req: CustomRequest, res: Response) {
    const user = req.user;
    const postId = req.params.postId;
    const { content } = req.body;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    if (!content) {
        res.status(400).json({ succes: false, message: "Missing content" });
        return;
    }

    const result = await postManager.updatePost(postId, user.id as string, undefined, content);
    res.json(result);
}

async function reactOnPost(req: CustomRequest, res: Response) {
    const user = req.user;
    const postId = req.params.postId;
    let { content, parentId } = req.body;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    if (!content) {
        res.status(400).json({ succes: false, message: "Missing content" });
        return;
    }

    if (!parentId) parentId = undefined;

    const result = await postManager.reactOnPost(postId, user.id as string, content, parentId);
    res.json(result);
}

async function likePost(req: CustomRequest, res: Response) {
    const user = req.user;
    const postId = req.params.postId;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.likePost(postId, user.id as string);
    res.json(result);
}

async function dislikePost(req: CustomRequest, res: Response) {
    const user = req.user;
    const postId = req.params.postId;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.dislikePost(postId, user.id as string);
    res.json(result);
}

async function deleteComment(req: CustomRequest, res: Response) {
    const user = req.user;
    const commentId = req.params.commentId;
    const postId = req.params.postId;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const result = await postManager.deleteComment(postId, user.id as string, commentId);
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
    reactOnPost,
    likePost,
    dislikePost,
    deleteComment
}