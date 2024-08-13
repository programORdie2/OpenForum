import { join } from "node:path";
import dotenv from "dotenv";
dotenv.config();

const PRODUCTION = false;
process.env.NODE_ENV = PRODUCTION ? "production" : "development";

const UPLOAD_PATH = join(__dirname, "../", "/uploads/");
const DATABASE = {
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT || 5432,
    name: process.env.DATABASE_NAME || "openforum",
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "secret"
}
const PORT = process.env.PORT || 3000;
const MAX_CLUSTER_SIZE = PRODUCTION ? -1 : 1; // ! Remove for production
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const MAX_LOGIN_ATTEMPTS = 5;

export { UPLOAD_PATH, DATABASE, PORT, JWT_SECRET, MAX_LOGIN_ATTEMPTS, MAX_CLUSTER_SIZE, PRODUCTION };