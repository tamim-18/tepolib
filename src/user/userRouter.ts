// we have to make the user router
import exp from "constants";
import express from "express";
import { createrUser, loginUser } from "./userController";

const userRouter = express.Router();

// creating the routes

userRouter.post("/register", createrUser);
userRouter.post("/login", loginUser);
// why are we using createrUser instead of createrUser()?
// because we are passing the reference of the function to the post method.

export default userRouter;
