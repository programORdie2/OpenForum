import { loginController, registerController, validateController } from "../controllers/auth.controller";
import * as settingsController from "../controllers/settings.controller";
import * as apiController from "../controllers/apiGet.controller";
import * as postContoller from "../controllers/post.controller";

import asyncHandler from "../utils/asyncHandler.util";

import { Router } from "express";
const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/validate", validateController);

router.post("/user/bio", asyncHandler(settingsController.changeBio));
router.post("/user/displayname", asyncHandler(settingsController.changeDisplayName));
router.post("/user/pronounce", asyncHandler(settingsController.changePronounce));
router.post('/user/avatar', asyncHandler(settingsController.changeAvatar));
router.post('/user/username', asyncHandler(settingsController.changeUsername));
router.post('/user/email', asyncHandler(settingsController.changeEmail));
router.post('/user/location', asyncHandler(settingsController.changeLocation));

router.get('/users/:username', asyncHandler(apiController.getProfile));

router.post('/posts/create', asyncHandler(postContoller.createPost));
router.post('/posts/:postId/publish', asyncHandler(postContoller.publishPost));
router.post('/posts/:postId/unpublish', asyncHandler(postContoller.unpublishPost));
router.get('/posts/:postId', asyncHandler(postContoller.getPost));

router.all("*", (req, res) => {
    res.status(404).json({ succes: false, message: "Route not found or method not allowed" });
})

export default router;