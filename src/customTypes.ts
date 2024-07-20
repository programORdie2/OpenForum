import { Request } from "express";

interface CustomRequest extends Request {
    user?: {
        authenticated: boolean;
        username?: string;
        email?: string;
        avatar?: string;
        pronounce?: string;
        bio?: string;
        displayName?: string;
    }
}

export { CustomRequest }