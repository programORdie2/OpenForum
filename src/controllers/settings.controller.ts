import { CustomRequest } from "../customTypes";
import { Response } from "express";

import { setSetting } from "../services/userSettings.service";

async function change(req: CustomRequest, res: Response, settingName: string) {
    const user = req.user;

    if (!user?.authenticated) {
        res.status(401).json({ succes: false, message: "Unauthorized" });
        return;
    }

    const { value } = req.body;

    if (!value) {
        res.status(400).json({ succes: false, message: "Missing value" });
        return;
    }

    const result = await setSetting(user.id as string, settingName, value);
    
    res.json({ succes: result });
}

async function changeBio(req: CustomRequest, res: Response) {
    await change(req, res, "bio");
}

async function changeDisplayName(req: CustomRequest, res: Response) {
    await change(req, res, "displayName");
}

async function changePronounce(req: CustomRequest, res: Response) {
    await change(req, res, "pronounce");
}

async function changeAvatar(req: CustomRequest, res: Response) {
    await change(req, res, "avatar");
}

async function changeUsername(req: CustomRequest, res: Response) {
    await change(req, res, "username");
}

async function changeEmail(req: CustomRequest, res: Response) {
    await change(req, res, "email");
}

export { changeBio, changeDisplayName, changePronounce, changeAvatar, changeUsername, changeEmail };