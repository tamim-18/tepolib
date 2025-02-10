import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(createHttpError(401, "Token is required"));
  }

  try {
    const parsedToken = token.split(" ")[1]; // Extract token from "Bearer <token>"
    const decoded = jwt.verify(parsedToken, config.jwtSecret as string) as {
      id: string;
    };

    // console.log("✅ Decoded Token:", decoded); // Debugging log

    if (!decoded.id) {
      return next(createHttpError(401, "Invalid token"));
    }

    const _req = req as AuthRequest;
    _req.userId = decoded.id; // ✅ Set req.userId

    next();
  } catch (err) {
    return next(createHttpError(401, "Token is expired or invalid"));
  }
};

export default authenticateUser;
