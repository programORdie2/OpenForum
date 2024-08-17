import type { Response, NextFunction } from "express";
import type CustomRequest from "../types/CustomRequest";

export default (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.url.endsWith(".css") && !req.url.endsWith(".js")) {
        return next();
    }

    const contentType = req.url.endsWith(".css") ? "text/css" : "application/javascript";

    if (req.headers["accept-encoding"]?.includes("br")) {
        res.setHeader("Content-Encoding", "br");
        res.setHeader("Content-Type", contentType);
        res.setHeader("vary", "Accept-Encoding");
        req.url = `${req.url}.br`;

        return next();
    }
    
    if (req.headers["accept-encoding"]?.includes("gzip")) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Type", contentType);
        res.setHeader("vary", "Accept-Encoding");
        req.url = `${req.url}.gz`;

        return next();
    }

    next();
}