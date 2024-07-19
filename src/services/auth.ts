import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { validateEmail, validatePassword, validateUsername } from './validator';
import database from './database';


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
    if (database.users[email]) return { succes: false, message: "User already exists" };

    // Hash password
    const hashedPassword = hashPassword(password);

    // Generate a user id
    const userId = generateUserId();

    // Add user to database
    database.users[email] = {
        username,
        email,
        password: hashedPassword,
        userId
    };

    // Generate token
    const token = generateToken(userId);

    return { succes: true, token };
}

// Login user
async function loginUser(email: string, password: string) {
    const user = database.users[email];

    if (!user) return { succes: false, message: "User does not exist" };
    if (!bcrypt.compareSync(password, user.password)) return { succes: false, message: "Wrong password" };

    const token = generateToken(user.userId);

    return { succes: true, token };
}

// Validate token
function validateToken(token: string) {
    let result: string | JwtPayload | undefined;

    try {
        result = _validateToken(token);
    } catch (error) {
        return { succes: false, message: "Invalid token" };
    }

    if (!result) return { succes: false, message: "Invalid token" };

    const userId = typeof result === 'string' ? result : result.id;
    const user = Object.values(database.users).find(user => user.userId === userId);

    if (!user) return { succes: false, message: "User does not exist" };

    return { succes: true, username: user.username, email: user.email };
}

export { registerUser, loginUser, validateToken }