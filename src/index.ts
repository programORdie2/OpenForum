import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cookieParser from "cookie-parser";

import asyncHandler from "./utils/asyncHandler";

import auth from "./middleware/auth.middleware";
import errorMiddleware from "./middleware/error.middleware";

import main from "./routes/main.route";
import api from "./routes/api.route";

import connectDB from "./services/database";

const app: Express = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/static"));

app.use(express.json());
app.use(cookieParser());

app.use(asyncHandler(auth));

app.use("/", main);
app.use("/api", api);

app.use(errorMiddleware);

async function start() {
  await connectDB();

  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

start()