import { Router } from "express";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/create", webController.sendCreatePostPage);
router.get("/:postId", webController.sendPostPage);
router.get("/:postId/manage", webController.sendPostManagerpage);

export default router;