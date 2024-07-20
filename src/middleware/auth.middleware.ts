import { Response, NextFunction } from "express";
import * as auth from "../services/auth";

import { CustomRequest } from "../customTypes";

export default async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization) {
        token = req.headers.authorization;
    } else {
        const cookies = req.cookies;
        token = cookies["token"];
    }

    if (!token) {
        req.user = {
            authenticated: false
        };
        return next();
    }

    const result = await auth.validateToken(token);
    if (result.succes) {
        req.user = {
            authenticated: true,
            username: result.username,
            email: result.email,
            avatar: result.avatar,
            pronounce: result.pronounce,
            bio: result.bio,
            displayName: result.displayName
        }
        return next();
    }

    req.user = {
        authenticated: false
    }
    return next();
}