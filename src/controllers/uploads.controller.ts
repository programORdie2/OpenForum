import type { Response } from "express";
import type CustomRequest from "../types/CustomRequest";
import { existsSync } from "node:fs";
import { UPLOAD_PATH } from "../config";
import { send404page } from "../controllers/www.controller";

// Send uploaded files
function handleUploads(req: CustomRequest, res: Response): void {
    const path = req.path;

    // If the file doesn't exist, send 404
    if (!existsSync(UPLOAD_PATH + path)) {
        send404page(req, res);
        return;
    }

    res.sendFile(UPLOAD_PATH + path);
};

export { handleUploads };