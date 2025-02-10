import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel"; // Adjust the path based on your project structure
import { AuthRequest } from "../types/AuthRequest"; // Define a custom AuthRequest type if needed

export const authorizeRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as AuthRequest;
      console.log(_req.userId);
      const user = await userModel.findById(_req.userId);

      if (user && roles.includes(user.role)) {
        return next();
      } else {
        return next(
          createHttpError(403, "Forbidden: Insufficient permissions")
        );
      }
    } catch (err) {
      return next(createHttpError(401, "Unauthorized"));
    }
  };
};
