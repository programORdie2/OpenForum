import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.model';

import { JWT_SECRET } from '../config';
import checkLogin from './loginRatelimiter.service';
import normalizeEmail from '../utils/normalizeEmail.util';
import { validateEmail, validatePassword, validateUsername } from '../utils/validator.util';

import { uploadDefaultAvater } from './imageDatabase.service';


// Generate JWT
function generateToken(id: string): string {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// Validate token
function _validateToken(token: string): string | JwtPayload | undefined {
    return jwt.verify(token, JWT_SECRET);
};

// Hash password
function hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

// Generate userid
function generateUserId(): string {
    return uuidv4();
}

// Register user
async function registerUser(email: string, password: string, username: string): Promise<{ succes: boolean, message?: string, token?: string }> {
    email = normalizeEmail(email);

    // Validate email, password and username
    if (!validateEmail(email)) return { succes: false, message: "Invalid email" };
    if (!validatePassword(password)) return { succes: false, message: "Invalid password" };
    if (!validateUsername(username)) return { succes: false, message: "Invalid username" };


    // Check if email already exists
    let existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) return { succes: false, message: "Email already in use" };

    // Check if username already exists
    existingUser = await User.findOne({ where: { username_lowercase: username.toLowerCase() } });
    if (existingUser) return { succes: false, message: "Username already in use" };

    // Hash password
    const hashedPassword = hashPassword(password);

    // Generate a user id
    const userId = generateUserId();
    const secretId = generateUserId();

    const avatarPath = `avatars/${userId}.png`;

    // Upload default avatar
    await uploadDefaultAvater(avatarPath);

    // Add the user in the database
    const user = await User.create({
        username,
        username_lowercase: username.toLowerCase(),
        email,
        password: hashedPassword,
        userId,
        secretId,
        avatar: "/uploads/" + avatarPath,
        displayName: username,

        createdAt: new Date(),
        permissions: { mod: false, admin: false },
        posts: [],
        comments: [],
        likes: [],
        followers: [],
        following: [],
        pronounce: "",
        bio: "",
        location: "",

        notifications: []
    });

    // Generate token
    const token = generateToken(secretId);

    return { succes: true, token };
}

// Login user
async function loginUser(emailorusername: string, password: string): Promise<{ succes: boolean, message?: string, token?: string }> {
    emailorusername = normalizeEmail(emailorusername);

    // Make sure we don't have too many login attempts
    if (!await checkLogin(emailorusername)) return { succes: false, message: "Too many login attempts" };

    // Check if email or username exists
    let user = await User.findOne({ where: { email: emailorusername } });
    if (!user) user = await User.findOne({ where: { username_lowercase: emailorusername } });
    if (!user) return { succes: false, message: "User does not exist" };

    // Validate password
    if (!bcrypt.compareSync(password, user.password)) return { succes: false, message: "Wrong password" };

    // Generate token
    const token = generateToken(user.secretId);
    return { succes: true, token };
}

// Validate token
async function validateToken(token: string): Promise<{ succes: boolean, username?: string, email?: string, avatar?: string, pronounce?: string, bio?: string, displayName?: string, location?: string, notificationAmount?: number, id?: string, message?: string }> {
    let result: string | JwtPayload | undefined;

    try {
        result = _validateToken(token);
    } catch (error) {
        return { succes: false, message: "Invalid token" };
    }

    if (!result) return { succes: false, message: "Invalid token" };

    const secretId = typeof result === 'string' ? result : result.id;
    const user = await User.findOne({ where: { secretId } });

    if (!user) return { succes: false, message: "User does not exist" };

    // If you change this, change it type definition in the types/CustomRequest.d.ts file
    // and in the definition of the validateToken function above
    return {
        succes: true,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        pronounce: user.pronounce,
        bio: user.bio,
        displayName: user.displayName,
        location: user.location,
        notificationAmount: user.notifications.length,
        id: user.userId
    };
}

export { registerUser, loginUser, validateToken }