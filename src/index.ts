import dotenv from "dotenv";
dotenv.config();

import express, { Express, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

import { CustomRequest } from "./customTypes";
import auth from "./middleware/auth.middleware";
import api from "./routes/api.route";

import connectDB from "./services/database";

const asyncHandler = (fn: Function) => (req: CustomRequest, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
}
const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use(asyncHandler(auth));

app.use("/api", api);

app.get("*", (req: CustomRequest, res: Response) => {
  let filepath: string = req.path;
  if (filepath.endsWith("/")) {
    filepath += "index.html";
  }
  if (filepath.split(".").length === 0) {
    filepath += ".html";
  }

  res.sendFile(__dirname + "/static/" + filepath);
});

async function start() {
  await connectDB();

  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

start()