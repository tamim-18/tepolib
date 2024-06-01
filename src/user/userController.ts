// creating user

import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const createrUser = async (req: Request, res: Response, next: NextFunction) => {
  //validation
  const { name, email, password } = req.body;
  console.log(name);
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //process
  //response
  res.json({ message: "User created" });
};

export { createrUser };

// why {createrUser} instead of createrUser?
// because we are exporting multiple things from this file.
// for example, we can export multiple functions, classes, or variables from a single file.
// give coding example
// export const a=1;
// export const b=2;
// export const c=3;
