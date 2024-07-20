import { CustomRequest } from "../customTypes";
import { Router, Response } from "express";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/", webController.sendHomepage);

router.get("/login", webController.sendLoginpage);
router.get("/register", webController.sendRegisterpage);
router.get("/logout", webController.logout);

router.get("/settings", webController.sendSettingspage);

router.get("/@:username", webController.sendUserProfilepage);

router.get("*", webController.handleNoView);

export default router;