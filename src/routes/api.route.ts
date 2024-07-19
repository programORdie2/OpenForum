import { loginController, registerController, validateController } from "../controllers/auth.controller";

import { Router } from "express";
const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/validate", validateController);

export default router;