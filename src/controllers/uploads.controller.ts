import { Response } from "express";
import CustomRequest from "../types/CustomRequest";
import { existsSync } from "fs";
import { UPLOAD_PATH } from "../config";
import { send404page } from "../controllers/www.controller";

function handleUploads(req: CustomRequest, res: Response) {
    const path = req.path;

    if (!existsSync(UPLOAD_PATH + path)) {
        send404page(req, res);
        return;
    }

    res.sendFile(UPLOAD_PATH + path);
};

export { handleUploads };