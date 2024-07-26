import { Request } from "express";

// Define custom request interface, used in auth middleware
interface CustomRequest extends Request {
    user?: {
        authenticated: boolean;
        username?: string;
        email?: string;
        avatar?: string;
        pronounce?: string;
        bio?: string;
        displayName?: string;
        location?: string;
        id?: string;
    }
}

export default CustomRequest