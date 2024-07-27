import { Response } from "express";
import CustomRequest from "../types/CustomRequest";
import { existsSync } from "fs";

import { loadUserProfile } from "../services/userProfileLoader.service";
import * as postManager from "../services/postManager.service";
import * as config from "../config"



/**
 * Renders a page with the given parameters and sends the rendered page as a response.
 *
 * @param {CustomRequest} req - The request object containing user information.
 * @param {Response} res - The response object used to send the rendered page.
 * @param {string} page - The name of the partial view to render.
 * @param {string} [customTitle="Social Media"] - The title of the page.
 * @param {number} [status=200] - The HTTP status code to send with the response.
 * @param {object} [data] - Additional data to pass to the partial view.
 * @param {Array<string>} [extraCss=[]] - Additional CSS files to include in the page.
 * @param {Array<string>} [extraJs=[]] - Additional JavaScript files to include in the page.
 * @return {void} This function does not return anything.
 */
function renderPage(req: CustomRequest, res: Response, page: string, customTitle: string = "Social Media", status: number = 200, data?: object, extraCss: Array<string> = [], extraJs: Array<string> = []): void {
    const user = req.user;
    const description = "Social media for everyone";

    const allData = { 
        title: customTitle,
        user: user,
        description: description,
        partialData: {},
        partialName: "partials/" + page,
        extraCss,
        extraJs,
        ...data
    };

    // Copy the data for the partial view
    allData.partialData = allData;

    res.status(status).render("main", allData);
}

function send404page(req: CustomRequest, res: Response): void {
    renderPage(req, res, "404", "404 - Page not found", 404);
}

function send500page(req: CustomRequest, res: Response): void {
    renderPage(req, res, "500", "500 - Internal server error", 500);
}

/**
 * Handles requests for files that do not have a corresponding view.
 *
 * @param {CustomRequest} req - The request object.
 * @param {Response} res - The response object.
 * @return {void} - This function does not return anything.
 */
function handleNoView(req: CustomRequest, res: Response): void {
    let filepath: string = req.path;

    // If the path ends with a slash, asume it's a directory and append index.html
    if (filepath.endsWith("/")) {
        filepath = filepath += "index.html";
    }

    // If the file has no extension, asume it's .html
    if (filepath.split(".").length === 0) {
        filepath += ".html";
    }

    // If this is a production build and it's a CSS/JS file, send the minified version
    if (config.PRODUCTION && (filepath.endsWith(".css") || filepath.endsWith(".js"))) {
        if (!existsSync(__dirname + "/static/min/" + filepath)) {
            send404page(req, res);
            return;
        }

        res.sendFile(__dirname + "/static/min/" + filepath);
        return;
    }

    // Check if the file exists
    if (!existsSync(__dirname + "/static/" + filepath)) {
        send404page(req, res);
        return;
    }
    res.sendFile(__dirname + "/static/" + filepath);
}

function sendHomepage(req: CustomRequest, res: Response): void {
    renderPage(req, res, "index", "Social Media", 200);
}

function sendLoginpage(req: CustomRequest, res: Response): void {
    if (req.user?.authenticated) {
        res.redirect("/");
        return;
    }
    renderPage(req, res, "login", "Login - Social Media", 200, {}, ["/css/login.css"], ["/scripts/auth.js"]);
}

function sendRegisterpage(req: CustomRequest, res: Response): void {
    if (req.user?.authenticated) {
        res.redirect("/");
        return;
    }
    renderPage(req, res, "register", "Register - Social Media", 200, {}, ["/css/register.css"], ["/scripts/auth.js"]);
}

function logout(req: CustomRequest, res: Response): void {
    res.clearCookie("token");
    res.redirect("/");
}

async function sendUserProfilepage(req: CustomRequest, res: Response): Promise<void> {
    const username = req.params.username;

    const userData = await loadUserProfile(username);
    if (!userData) {
        send404page(req, res);
        return;
    }

    renderPage(req, res, "userProfile", `${userData.username} - Social Media`, 200, { profile: userData }, ["/css/userProfile.css"], ["/scripts/userProfile.js"]);
}

async function sendSettingspage(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/settings")
        return;
    }
    renderPage(req, res, "settings", "Settings - Social Media", 200, { data: user }, ["/css/settings.css"], ["/scripts/settings.js"]);
}

async function sendPostPage(req: CustomRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const postId = req.params.postId;

    const post = await postManager.getPost(postId, userId, true);

    if (!post || !post.succes || !post.post) {
        send404page(req, res);
        return;
    }

    renderPage(req, res, "post", `${post.post.title} - Social Media`, 200, { post: post.post, highlightedComment: req.params.commentId }, ["/css/post.css"], ["/scripts/post.js"]);
}

function sendCreatePostPage(req: CustomRequest, res: Response): void {
    renderPage(req, res, "createPost", "Create Post - Social Media", 200, {}, ["/css/createPost.css"], ["/scripts/createPost.js"]);
}

async function sendDashboardpage(req: CustomRequest, res: Response): Promise<void> {
    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/dashboard");
        return;
    }

    const posts = await postManager.getUserPosts(user.id as string);    

    renderPage(req, res, "dashboard", "Dashboard - Social Media", 200, { posts: posts.posts }, ["/css/dashboard.css"], ["/scripts/dashboard.js"]);
}

async function sendPostManagerpage(req: CustomRequest, res: Response): Promise<void> {
    const postId = req.params.postId;

    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/" + postId + "/manage");
        return;
    }

    const post = await postManager.getPost(postId, user.id as string);
    if (!post || !post.succes || !post.post) {
        send404page(req, res);
        return;
    }

    if (post.post.authorId != user.id) {
        send404page(req, res);
        return;
    }

    renderPage(req, res, "postManager", "Post Manager - Social Media", 200, { post: post.post }, ["/css/postManager.css"], ["/scripts/postManager.js"]);
}

async function sendPostEditpage(req: CustomRequest, res: Response): Promise<void> {
    const postId = req.params.postId;
    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/" + postId + "/edit");
        return;
    }
    const post = await postManager.getPost(postId, user.id as string);
    if (!post || !post.succes || !post.post) {
        send404page(req, res);
        return;
    }

    if (post.post.authorId != user.id) {
        send404page(req, res);
        return;
    }

    renderPage(req, res, "postEdit", "Post Edit - Social Media", 200, { post: post.post }, ["/css/postEdit.css"], ["/scripts/editPost.js"]);
}

export { 
    send404page, 
    send500page, 
    sendHomepage, 
    handleNoView, 
    sendLoginpage, 
    logout, 
    sendRegisterpage, 
    sendUserProfilepage, 
    sendSettingspage,
    sendPostPage,
    sendCreatePostPage,
    sendDashboardpage,
    sendPostManagerpage,
    sendPostEditpage
};