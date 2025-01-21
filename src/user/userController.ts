import { User } from "./userTypes";
// creating user

import dotenv from "dotenv";
dotenv.config();

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import userModel from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createrUser = async (req: Request, res: Response, next: NextFunction) => {
  //validation
  const { name, email, password } = req.body;
  // console.log(name);
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //database call
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      const error = createHttpError(400, "User already exists");
      // why 400 status code?
      // because the request is bad. The user is trying to create a user that already exists.
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }

  //create user. store the user in the database
  // hashig using bcrypt

  const hashedPassword = await bcrypt.hash(password, 10);
  // console.log(hashedPassword);
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    // console.log(newUser);
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }

  // token generation using jwt
  // jwt.sign({payload}, secret, {options})
  // options: expiresIn, algorithm, issuer, audience
  const token = sign({ id: newUser._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  //response
  res.status(201).json({ accessToken: token });
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  //validation
  const { email, password } = req.body;
  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(createHttpError(400, "username or password incorrect"));

    // token generation using jwt
    // jwt.sign({payload}, secret, {options})
    // options: expiresIn, algorithm, issuer, audience
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    return res.status(200).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(404, "User not found"));
  }

  res.status(201).json({ message: "login" });
};

export { createrUser, loginUser };

// why {createrUser} instead of createrUser?
// because we are exporting multiple things from this file.
// for example, we can export multiple functions, classes, or variables from a single file.
// give coding example
// export const a=1;
// export const b=2;
// export const c=3;
