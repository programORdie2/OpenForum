import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.util";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/", webController.sendHomepage);

router.get("/login", webController.sendLoginpage);
router.get("/register", webController.sendRegisterpage);
router.get("/logout", webController.logout);

router.get("/settings", asyncHandler(webController.sendSettingspage));
router.get("/dashboard", asyncHandler(webController.sendDashboardpage));

router.get("/@:username", asyncHandler(webController.sendUserProfilepage));

router.get("*", webController.handleNoView);

export default router;