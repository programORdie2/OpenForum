import { loadUserProfile } from "../services/userProfileLoader.service";
import * as followManager from "../services/userFollow.service";

import CustomRequest from "../types/CustomRequest";
import { Response } from "express";
import { getNotifications, markAllAsRead } from "../services/notification.service";

// Loads a user profile for the API
async function getProfile(req: CustomRequest, res: Response): Promise<void> {
    const username = req.params.username;
    const userData = await loadUserProfile(username);
    if (!userData) {
        res.status(404).json({ succes: false, message: "User not found" });
        return;
    }

    res.json({ succes: true, profile: userData });
}

// Follow a user
async function followUser(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const followName = req.params.username;

    if (!user || !user.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const userId = user.id as string;

    const result = await followManager.followUser(userId, followName);
    res.json(result);
}

// Unfollow a user
async function unfollowUser(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const followName = req.params.username;

    if (!user || !user.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const userId = user.id as string;

    const result = await followManager.unfollowUser(userId, followName);
    res.json(result);
}

async function loadNotifications(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 50);

    if (!user || !user.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }
    const userId = user?.id as string;
    const notifications = await getNotifications(userId, offset, limit);
    res.json(notifications);
}

async function markNotificationAsRead(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user || !user.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const userId = user?.id as string;
    const result = await markAllAsRead(userId);

    res.json(result);
}

export {
    getProfile,
    followUser,
    unfollowUser,
    loadNotifications,
    markNotificationAsRead
}