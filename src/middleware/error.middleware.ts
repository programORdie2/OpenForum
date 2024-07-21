import { NextFunction, Response } from "express";
import { CustomRequest } from "../customTypes";

import { send500page } from "../controllers/www.controller";
import logger from "../utils/logger.util";

export default async (err: any, req: CustomRequest, res: Response, next: NextFunction) => {
    logger.error(err);

    send500page(req, res);
}