import i18n from "../services/i18n.service";

import type CustomRequest from "types/CustomRequest";
import type { NextFunction, Response } from "express";

export default (req: CustomRequest, res: Response, next: NextFunction) => {
    i18n.init(req, res);
    next();
}