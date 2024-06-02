// creating user

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import userModel from "./userModel";

const createrUser = async (req: Request, res: Response, next: NextFunction) => {
  //validation
  const { name, email, password } = req.body;
  console.log(name);
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //database call
  const user = await userModel.findOne({ email: email });
  if (user) {
    const error = createHttpError(400, "User already exists");
    // why 400 status code?
    // because the request is bad. The user is trying to create a user that already exists.
    return next(error);
  }

  //create user. store the user in the database
  // hashig using bcrypt

  const hashedPassword = await bcrypt.hash(password, 10);

  await userModel.create({ name, email, password });

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
