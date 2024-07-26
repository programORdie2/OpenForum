import * as auth from "../services/auth.service";
import CustomRequest from "../types/CustomRequest";
import { Response } from "express";

// Login a user
async function loginController(req: CustomRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Validate email and password
    const result = await auth.loginUser(email, password);
    if (result.succes) {
        res.json({ succes: true, token: result.token });
        return;
    }

    // Wrong credentials
    res.json({ succes: false, message: result.message });
}

// Register a user
async function registerController(req: CustomRequest, res: Response): Promise<void> {
    const { email, password, username } = req.body;

    // Try to register
    const result = await auth.registerUser(email, password, username);
    if (result.succes) {
        res.json({ succes: true, token: result.token });
        return;
    }

    // Registration failed
    res.json({ succes: false, message: result.message });
}

// Validate a token
async function validateController(req: CustomRequest, res: Response): Promise<void> {
    const { token } = req.body;
    const result = auth.validateToken(token);
    res.json(result);
}

export {
    loginController,
    registerController,
    validateController
}