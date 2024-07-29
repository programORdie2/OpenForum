import CustomRequest from "../types/CustomRequest";
import logger from "../utils/logger.util";
import { Response, NextFunction } from "express";

export default async (req: CustomRequest, res: Response, next: NextFunction) => {
    logger.http(`[${req.method}] ${req.path}`);
    next();
}