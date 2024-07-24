import { NextFunction, Response } from "express";
import CustomRequest from "../types/CustomRequest";

import { send500page } from "../controllers/www.controller";
import logger from "../utils/logger.util";

export default async (err: any, req: CustomRequest, res: Response, next: NextFunction) => {
    logger.error(err);

    if (req.path.startsWith("/api/")) {
        res.status(500).json({ succes: false, message: "Internal server error" });
        return;
    }
    
    send500page(req, res);
}