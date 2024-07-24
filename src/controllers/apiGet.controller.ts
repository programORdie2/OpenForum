import { loadUserProfile } from "../services/userProfileLoader.service";
import CustomRequest from "../types/CustomRequest";
import { Response } from "express";

export async function getProfile(req: CustomRequest, res: Response) {
    const username = req.params.username;
    const userData = await loadUserProfile(username);
    if (!userData) {
        res.status(404).json({ succes: false, message: "User not found" });
        return;
    }

    res.json({ succes: true, profile: userData });
}