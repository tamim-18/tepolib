import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel";
import { AuthRequest } from "../types/AuthRequest";

export const isBanned = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const user = await userModel.findById(_req.userId);

    if (user?.isBanned) {
      return next(
        createHttpError(
          403,
          "Forbidden: You are banned from using this platform"
        )
      );
    } else {
      return next();
    }
  } catch (err) {
    return next(createHttpError(401, "Unauthorized"));
  }
};
