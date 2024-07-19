import dotenv from "dotenv";
dotenv.config();

import express, { Express, Response } from "express";
import cookieParser from "cookie-parser";

import { CustomRequest } from "./customTypes";
import auth from "./middleware/auth.middleware";
import api from "./routes/api.route";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use(auth);

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

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});