import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel";
import { AuthRequest } from "../types/AuthRequest";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const user = await userModel.findById(_req.userId);

    if (user?.role === "admin") {
      return next();
    } else {
      return next(createHttpError(403, "Unauthorized: Admin access required"));
    }
  } catch (err) {
    return next(createHttpError(401, "Unauthorized"));
  }
};
