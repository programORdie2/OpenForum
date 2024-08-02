import type { Response, NextFunction } from "express";
import type CustomRequest from "../types/CustomRequest";

const asyncHandler = (fn: Function) => (req: CustomRequest, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler