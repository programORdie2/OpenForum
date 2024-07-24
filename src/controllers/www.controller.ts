import { Response } from "express";
import CustomRequest from "../types/CustomRequest";
import { existsSync } from "fs";

import { loadUserProfile } from "../services/userProfileLoader.service";
import * as postManager from "../services/postManager.service";

function renderPage(req: CustomRequest, res: Response, page: string, customTitle: string = "Social Media", status: number = 200, data?: object, extraCss: Array<string> = [], extraJs: Array<string> = []) {
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
    allData.partialData = allData;

    res.status(status).render("main", allData);
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
    renderPage(req, res, "login", "Login - Social Media", 200, {}, ["/css/login.css"], ["/scripts/auth.js"]);
}

function sendRegisterpage(req: CustomRequest, res: Response) {
    if (req.user?.authenticated) {
        res.redirect("/");
        return;
    }
    renderPage(req, res, "register", "Register - Social Media", 200, {}, ["/css/register.css"], ["/scripts/auth.js"]);
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

    renderPage(req, res, "userProfile", `${userData.username} - Social Media`, 200, { profile: userData }, ["/css/userProfile.css"], []);
}

async function sendSettingspage(req: CustomRequest, res: Response) {
    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/settings")
        return;
    }
    renderPage(req, res, "settings", "Settings - Social Media", 200, { data: user }, ["/css/settings.css"], ["/scripts/settings.js"]);
}

async function sendPostPage(req: CustomRequest, res: Response) {
    const userId = req.user?.id;
    const postId = req.params.postId;

    const post = await postManager.getPost(postId, userId, true);

    if (!post || !post.succes || !post.post) {
        send404page(req, res);
        return;
    }

    renderPage(req, res, "post", `${post.post.title} - Social Media`, 200, { post: post.post }, ["/css/post.css"], ["/scripts/post.js"]);
}

function sendCreatePostPage(req: CustomRequest, res: Response) {
    renderPage(req, res, "createPost", "Create Post - Social Media", 200, {}, ["/css/createPost.css"], ["/scripts/createPost.js"]);
}

async function sendDashboardpage(req: CustomRequest, res: Response) {
    const user = req.user;
    if (!user?.authenticated) {
        res.redirect("/login?redirect=/dashboard");
        return;
    }

    const posts = await postManager.getUserPosts(user.id as string);    

    renderPage(req, res, "dashboard", "Dashboard - Social Media", 200, { posts: posts.posts }, ["/css/dashboard.css"], ["/scripts/dashboard.js"]);
}

async function sendPostManagerpage(req: CustomRequest, res: Response) {
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
    sendPostManagerpage
};