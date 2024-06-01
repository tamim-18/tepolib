// creating user

import { NextFunction, Request, Response } from "express";

const createrUser = async (req: Request, res: Response, next: NextFunction) => {
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
