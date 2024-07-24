import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { validateEmail, validatePassword, validateUsername } from '../utils/validator.util';
import { User } from '../models/user.model';

import { uploadDefaultAvater } from './imageDatabase.service';

import { JWT_SECRET } from '../config';
import checkLogin from './loginRatelimiter.service';
import normalizeEmail from '../utils/normalizeEmail.util';


// Generate JWT
function generateToken(id: string) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// Validate token
function _validateToken(token: string) {
    const JWT_SECRET = process.env.JWT_SECRET as Secret;
    return jwt.verify(token, JWT_SECRET);
};

// Hash password
function hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

// Generate userid
function generateUserId() {
    return uuidv4();
}

// Register user
async function registerUser(email: string, password: string, username: string) {
    email = normalizeEmail(email);

    // Validate email, password and username
    if (!validateEmail(email)) return { succes: false, message: "Invalid email" };
    if (!validatePassword(password)) return { succes: false, message: "Invalid password" };
    if (!validateUsername(username)) return { succes: false, message: "Invalid username" };


    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) return { succes: false, message: "Email already in use" };

    // Check if username already exists
    existingUser = await User.findOne({ username_lowercase: username.toLowerCase() });
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
    const user = new User({ 
        username,
        username_lowercase: username.toLowerCase(),
        email, 
        password: hashedPassword, 
        userId, 
        secretId, 
        avatar: "/uploads/" + avatarPath,
        displayName: username
    });
    await user.save();

    // Generate token
    const token = generateToken(secretId);

    return { succes: true, token };
}

// Login user
async function loginUser(emailorusername: string, password: string) {
    emailorusername = normalizeEmail(emailorusername);

    if (!await checkLogin(emailorusername)) return { succes: false, message: "Too many login attempts" };

    const user = await User.findOne({ email: emailorusername }) || await User.findOne({ username_lowercase: emailorusername });

    if (!user) return { succes: false, message: "User does not exist" };
    if (!bcrypt.compareSync(password, user.password)) return { succes: false, message: "Wrong password" };

    const token = generateToken(user.secretId);

    return { succes: true, token };
}

// Validate token
async function validateToken(token: string) {
    let result: string | JwtPayload | undefined;

    try {
        result = _validateToken(token);
    } catch (error) {
        return { succes: false, message: "Invalid token" };
    }

    if (!result) return { succes: false, message: "Invalid token" };

    const secretId = typeof result === 'string' ? result : result.id;
    const user = await User.findOne({ secretId });

    if (!user) return { succes: false, message: "User does not exist" };

    return { 
        succes: true, 
        username: user.username, 
        email: user.email, 
        avatar: user.avatar, 
        pronounce: user.pronounce, 
        bio: user.bio, 
        displayName: user.displayName, 
        location: user.location, 
        id: user.userId 
    };
}

export { registerUser, loginUser, validateToken }