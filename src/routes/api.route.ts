import { loginController, registerController, validateController } from "../controllers/auth.controller";
import * as settingsController from "../controllers/settings.controller";
import * as apiController from "../controllers/api.controller";
import * as postContoller from "../controllers/post.controller";

import asyncHandler from "../utils/asyncHandler.util";
import { Router } from "express";

const router = Router();

// Auth routes
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/validate", validateController);

// User settings routes
router.post("/user/bio", asyncHandler(settingsController.changeBio));
router.post("/user/displayname", asyncHandler(settingsController.changeDisplayName));
router.post("/user/pronounce", asyncHandler(settingsController.changePronounce));
router.post('/user/avatar', asyncHandler(settingsController.changeAvatar));
router.post('/user/username', asyncHandler(settingsController.changeUsername));
router.post('/user/email', asyncHandler(settingsController.changeEmail));
router.post('/user/location', asyncHandler(settingsController.changeLocation));

// User routes
router.get('/users/:username', asyncHandler(apiController.getProfile));
router.get('/users/:username/comments', asyncHandler(apiController.getComments));

// User follow routes
router.post('/users/:username/follow', asyncHandler(apiController.followUser));
router.post('/users/:username/unfollow', asyncHandler(apiController.unfollowUser));

// Post edit and create routes
router.post('/posts/create', asyncHandler(postContoller.createPost));
router.post('/posts/:postId/title', asyncHandler(postContoller.setTitle));
router.post('/posts/:postId/content', asyncHandler(postContoller.setContent));

// Post management routes
router.post('/posts/:postId/publish', asyncHandler(postContoller.publishPost));
router.post('/posts/:postId/unpublish', asyncHandler(postContoller.unpublishPost));
router.delete('/posts/:postId/delete', asyncHandler(postContoller.deletePost));

// Post user routes
router.post('/posts/:postId/like', asyncHandler(postContoller.likePost));
router.post('/posts/:postId/unlike', asyncHandler(postContoller.unlikePost));

// Post comment routes
router.post('/posts/:postId/comments', asyncHandler(postContoller.commentOnPost));
router.post('/posts/:postId/comments/:commentId/like', asyncHandler(postContoller.likeComment));
router.post('/posts/:postId/comments/:commentId/unlike', asyncHandler(postContoller.unlikeComment));
router.delete('/posts/:postId/comments/:commentId/delete', asyncHandler(postContoller.deleteComment));

// Post routes
router.get('/posts/:postId', asyncHandler(postContoller.getPost));

// Notification routes
router.get('/notifications', asyncHandler(apiController.loadNotifications));
router.post('/notifications/read', asyncHandler(apiController.markNotificationAsRead));

// Tag routes
router.get('/tag_autocomplete', asyncHandler(apiController.autocompleteTag));


// Admin routes
router.post('/admin/create_tag', asyncHandler(apiController.createTag));

// Unhandled routes
router.all("*", (req, res) => {
    res.status(404).json({ succes: false, message: "Route not found or method not allowed" });
})

export default router;