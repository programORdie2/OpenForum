import * as auth from "../services/auth.service";
import { CustomRequest } from "../customTypes";
import { Response } from "express";

async function loginController(req: CustomRequest, res: Response) {
    const { email, password } = req.body;

    const result = await auth.loginUser(email, password);
    if (result.succes) {
        res.json({ succes: true, token: result.token });
        return;
    }

    res.json({ succes: false, message: result.message });
}

async function registerController(req: CustomRequest, res: Response) {
    const { email, password, username } = req.body;

    const result = await auth.registerUser(email, password, username);
    if (result.succes) {
        res.json({ succes: true, token: result.token });
        return;
    }

    res.json({ succes: false, message: result.message });
}

async function validateController(req: CustomRequest, res: Response) {
    const { token } = req.body;
    const result = auth.validateToken(token);
    res.json(result);
}

export {
    loginController,
    registerController,
    validateController
}