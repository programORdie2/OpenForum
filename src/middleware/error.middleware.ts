import { NextFunction, Response } from "express";
import { CustomRequest } from "../customTypes";

import { send500page } from "../controllers/www.controller";

export default async (err: any, req: CustomRequest, res: Response, next: NextFunction) => {
    console.error(err);

    send500page(req, res);
}