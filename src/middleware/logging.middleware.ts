import type CustomRequest from "../types/CustomRequest";
import logger from "../utils/logger.util";
import type { Response, NextFunction } from "express";

export default async (req: CustomRequest, res: Response, next: NextFunction) => {
    logger.http(`[${req.method}] ${req.path}`);
    next();
}