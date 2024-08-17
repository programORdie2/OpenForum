import { Router } from "express";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/:tag", webController.sendTagPage);

export default router;