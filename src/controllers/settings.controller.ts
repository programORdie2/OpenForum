import type CustomRequest from "../types/CustomRequest";
import type { Response } from "express";

import { setSetting } from "../services/userSettings.service";


/**
 * Changes a user's setting.
 *
 * @param {CustomRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {string} settingName - The name of the setting to change.
 * @return {Promise<void>} A promise that resolves when the setting is changed.
 */
async function change(req: CustomRequest, res: Response, settingName: string): Promise<void> {
    const user = req.user;

    // Check if user is authenticated
    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const { value } = req.body;

    // Check if value is provided
    if (!value) {
        res.status(400).json({ succes: false, message: "Missing value" });
        return;
    }

    const result = await setSetting(user.id as string, settingName, value);

    res.json({ succes: result });
}

async function changeBio(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "bio");
}

async function changeDisplayName(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "displayName");
}

async function changePronounce(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "pronounce");
}

async function changeAvatar(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "avatar");
}

async function changeUsername(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "username");
}

async function changeEmail(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "email");
}

async function changeLocation(req: CustomRequest, res: Response): Promise<void> {
    await change(req, res, "location");
}

export {
    changeBio,
    changeDisplayName,
    changePronounce,
    changeAvatar,
    changeUsername, 
    changeEmail, 
    changeLocation
};