import { CustomRequest } from "../customTypes";
import { Router, Response } from "express";

import * as webController from "../controllers/www.controller";

const router = Router();

router.get("/", webController.sendHomepage);

router.get("*", webController.handleNoView);

export default router;