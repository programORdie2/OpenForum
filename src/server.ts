import { PORT } from "./config";

import express, { Express } from "express";
import cookieParser from "cookie-parser";

import logger from "./utils/logger.util";
import asyncHandler from "./utils/asyncHandler.util";

import auth from "./middleware/auth.middleware";
import errorMiddleware from "./middleware/error.middleware";

import main from "./routes/main.route";
import posts from "./routes/posts.route";
import api from "./routes/api.route";
import uploads from "./routes/uploads.route";

const app: Express = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/static"));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(asyncHandler(auth));

app.use("/api", api);
app.use("/posts", posts);
app.use("/uploads", uploads);
app.use("/", main);

app.use(errorMiddleware);

async function start() {
  app.listen(PORT, () => {
    logger.log(`Server is running at http://localhost:${PORT}`);
  });
}

export { start };