import type { NextFunction, Response, Errback } from "express";
import type CustomRequest from "../types/CustomRequest";

import { send500page } from "../controllers/www.controller";
import logger from "../utils/logger.util";

// Handle and log errors
export default async (err: Errback | Error, req: CustomRequest, res: Response, next: NextFunction) => {
    logger.error(err);

    // Send JSON error if it's an API request
    if (req.path.startsWith("/api/")) {
        res.status(500).json({ succes: false, message: "Internal server error" });
        return;
    }

    send500page(req, res);
}