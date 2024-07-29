// A worker process

import { PORT } from "./config";

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import compression from "compression";

import logger from "./utils/logger.util";
import asyncHandler from "./utils/asyncHandler.util";

import auth from "./middleware/auth.middleware";
import errorMiddleware from "./middleware/error.middleware";
import loggingMiddleware from "./middleware/logging.middleware";

import main from "./routes/main.route";
import posts from "./routes/posts.route";
import api from "./routes/api.route";
import uploads from "./routes/uploads.route";
import * as config from "./config";

// Init
const app: Express = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

if (config.PRODUCTION) {
  app.use(express.static(__dirname + "/static/min"));
} else {
  app.use(express.static(__dirname + "/static"));
}

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(compression());
app.use(asyncHandler(auth));
app.use((req, res, next) => {
  loggingMiddleware(req, res, next);
});

// Routes
app.use("/api", api);
app.use("/posts", posts);
app.use("/uploads", uploads);
app.use("/", main);

// Error middleware
app.use(errorMiddleware);

// Run this function in the worker process to start the server
async function start(): Promise<void> {
  app.listen(PORT, () => {
    logger.log(`Server is running at http://localhost:${PORT}`);
  });
}

export { start };