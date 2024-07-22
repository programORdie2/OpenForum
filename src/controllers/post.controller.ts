import { Response } from "express";
import { CustomRequest } from "../customTypes";
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

export { createPost }