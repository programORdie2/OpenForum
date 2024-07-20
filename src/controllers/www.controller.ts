import { Response } from "express";
import { CustomRequest } from "../customTypes";
import { existsSync } from "fs";

import { loadUserProfile } from "../services/userProfileLoader";

function renderPage(req: CustomRequest, res: Response, page: string, customTitle: string = "Social Media", status: number = 200, data?: object) {
    const user = req.user;
    const description = "Social media for everyone";
    res.status(status).render(page, { title: customTitle, user: user, description: description, ...data });
}

function send404page(req: CustomRequest, res: Response) {
    renderPage(req, res, "404", "404 - Page not found", 404);
}

function send500page(req: CustomRequest, res: Response) {
    renderPage(req, res, "500", "500 - Internal server error", 500);
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
    renderPage(req, res, "index", "Social Media", 200);
}

function sendLoginpage(req: CustomRequest, res: Response) {
    if (req.user?.authenticated) {
        res.redirect("/");
        return;
    }
    renderPage(req, res, "login", "Login - Social Media", 200);
}

function sendRegisterpage(req: CustomRequest, res: Response) {
    if (req.user?.authenticated) {
        res.redirect("/");
        return;
    }
    renderPage(req, res, "register", "Register - Social Media", 200);
}

function logout(req: CustomRequest, res: Response) {
    res.clearCookie("token");
    res.redirect("/");
}

async function sendUserProfilepage(req: CustomRequest, res: Response) {
    const username = req.params.username;

    const userData = await loadUserProfile(username);
    if (!userData) {
        send404page(req, res);
        return;
    }
    renderPage(req, res, "userProfile", `${userData.username} - Social Media`, 200, { profile: userData });
}

export { send404page, send500page, sendHomepage, handleNoView, sendLoginpage, logout, sendRegisterpage, sendUserProfilepage };