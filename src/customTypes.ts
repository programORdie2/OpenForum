import { Request } from "express";

interface CustomRequest extends Request {
    user?: {
        authenticated: boolean;
        username?: string;
        email?: string;
        avatar?: string;
    }
}

export { CustomRequest }