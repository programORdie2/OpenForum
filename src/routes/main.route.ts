import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.util";

import * as webController from "../controllers/www.controller";

const router = Router();

// Main routes
router.get("/", webController.sendHomepage);

// Auth routes
router.get("/login", webController.sendLoginpage);
router.get("/register", webController.sendRegisterpage);
router.get("/logout", webController.logout);

// User routes
router.get("/settings", asyncHandler(webController.sendSettingspage));
router.get("/dashboard", asyncHandler(webController.sendDashboardpage));

// User profile routes
router.get("/@:username", asyncHandler(webController.sendUserProfilepage));

// Unhandled routes
router.get("*", webController.handleNoView);

export default router;