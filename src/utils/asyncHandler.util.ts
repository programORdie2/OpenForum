import { Response, NextFunction } from "express";
import { CustomRequest } from "../customTypes";

const asyncHandler = (fn: Function) => (req: CustomRequest, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler