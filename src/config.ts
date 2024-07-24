import { join } from "path";
import dotenv from "dotenv";
dotenv.config();

const UPLOAD_PATH = join(__dirname, "../", "/uploads/");
const DATABASE_URL = process.env.DB_URL || "mongodb://localhost:27017/openforum";
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const MAX_LOGIN_ATTEMPTS = 5;
const TOPICS = [
    "news",
    "tech",
    "sport",
    "fun"
]

export { UPLOAD_PATH, DATABASE_URL, PORT, JWT_SECRET, MAX_LOGIN_ATTEMPTS, TOPICS };