import dotenv from "dotenv";
dotenv.config();

import { PORT } from "./config";

import express, { Express } from "express";
import cookieParser from "cookie-parser";

import asyncHandler from "./utils/asyncHandler.util";

import auth from "./middleware/auth.middleware";
import errorMiddleware from "./middleware/error.middleware";

import main from "./routes/main.route";
import api from "./routes/api.route";
import uploads from "./routes/uploads.route";

import connectDB from "./services/database.service";
import logger from "./utils/logger.util";

const app: Express = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/static"));

app.use(express.json());
app.use(cookieParser());

app.use(asyncHandler(auth));

app.use("/api", api);
app.use("/uploads", uploads);
app.use("/", main);

app.use(errorMiddleware);

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    logger.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();

// Don't shut down the server directly
process.stdin.resume();

function exitHandler(error: Error | string | null) {
  if (error) {
    let type: string;
    if (error === "SIGTERM" || error === "SIGINT") {
      type = error;
    } else {
      type = "uncaughtException";

      logger.critical(error);
    }
    logger.critical(`Server is shutting down due to: ${type}`);
  }

  process.exit();
}

process.on("SIGINT", exitHandler.bind(null, "SIGINT"));
process.on("SIGTERM", exitHandler.bind(null, "SIGTERM"));
process.on("uncaughtException", exitHandler);

let error: string = 5;