import { Response, NextFunction } from "express";
import { CustomRequest } from "../customTypes";
import { existsSync } from "fs";

function send404page(req: CustomRequest, res: Response) {
    res.status(404).render("404");
}

function send500page(req: CustomRequest, res: Response) {
    res.status(500).render("500");
}

function handleNoView(req: CustomRequest, res: Response) {
    let filepath: string = req.path;
    if (filepath.endsWith("/")) {
        filepath = filepath += "index.html";
    }
    if (filepath.split(".").length === 0) {
        filepath += ".html";
    }

    if (!existsSync(__dirname + "/static/" + filepath)) {
        send404page(req, res);
        return;
    }
    res.sendFile(__dirname + "/static/" + filepath);
}

function sendHomepage(req: CustomRequest, res: Response) {
    res.render("index");
}

export { send404page, send500page, sendHomepage, handleNoView };