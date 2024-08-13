import type { Response, NextFunction } from "express";
import * as auth from "../services/auth.service";

import type CustomRequest from "../types/CustomRequest";

export default async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // If there is a token in the request headers, use it, otherwise use the cookies
    if (req.headers.authorization) {
        token = req.headers.authorization;
    } else {
        const cookies = req.cookies;
        token = cookies.token;
    }

    if (!token) {
        req.user = {
            authenticated: false
        };
        return next();
    }

    const result = await auth.validateToken(token);
    if (result.succes) {
        // If you change this, change it in the auth.service too
        req.user = {
            authenticated: true,
            username: result.username,
            email: result.email,
            avatar: result.avatar,
            pronounce: result.pronounce,
            bio: result.bio,
            displayName: result.displayName,
            location: result.location,
            notificationAmount: result.notificationAmount,
            id: result.id,
            permissions: result.permissions
        }
        return next();
    }

    req.user = {
        authenticated: false
    }
    return next();
}