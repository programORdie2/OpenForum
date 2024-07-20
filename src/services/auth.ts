import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { validateEmail, validatePassword, validateUsername } from './validator';
import { User } from '../models/user.model';

import { uploadDefaultAvater } from './imageDatabase';
import { UPLOAD_PATH } from '../config';


// Generate JWT
function generateToken(id: string) {
    const JWT_SECRET = process.env.JWT_SECRET as Secret;
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
    // Validate email, password and username
    if (!validateEmail(email)) return { succes: false, message: "Invalid email" };
    if (!validatePassword(password)) return { succes: false, message: "Invalid password" };
    if (!validateUsername(username)) return { succes: false, message: "Invalid username" };


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return { succes: false, message: "User already exists" };

    // Hash password
    const hashedPassword = hashPassword(password);

    // Generate a user id
    const userId = generateUserId();
    const secretId = generateUserId();
    
    const avatarPath = `${UPLOAD_PATH}/avatars/${userId}.png`;

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
        avatar: avatarPath
    });
    await user.save();

    // Generate token
    const token = generateToken(secretId);

    return { succes: true, token };
}

// Login user
async function loginUser(email: string, password: string) {
    const user = await User.findOne({ email });

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

    return { succes: true, username: user.username, email: user.email, avatar: user.avatar };
}

export { registerUser, loginUser, validateToken }