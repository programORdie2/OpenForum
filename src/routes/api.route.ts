import { loginController, registerController, validateController } from "../controllers/auth.controller";
import * as settingsController from "../controllers/settings.controller";

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

router.all("*", (req, res) => {
    res.status(404).json({ succes: false, message: "Route not found or method not allowed" });
})

export default router;