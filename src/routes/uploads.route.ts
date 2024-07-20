import { Router } from "express";

import * as uploadsController from "../controllers/uploads.controller";

const router = Router();

router.get("*", uploadsController.handleUploads);

export default router;