import { loginController, registerController, validateController } from "../controllers/auth.controller";

import { Router } from "express";
const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/validate", validateController);

router.all("*", (req, res) => {
    res.status(404).json({ succes: false, message: "Route not found or method not allowed" });
})

export default router;