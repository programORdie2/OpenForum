import { Router } from "express";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/create", webController.sendCreatePostPage);
router.get("/:postId", webController.sendPostPage);

export default router;